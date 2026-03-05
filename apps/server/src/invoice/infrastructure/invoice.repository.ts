import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from '../domain/invoice.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IStatusCounts, InvoiceStatus } from '@keshet/shared';

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly repo: Repository<InvoiceEntity>,
  ) {}

  async findPaginated(
    query: PaginationQueryDto,
  ): Promise<{ items: InvoiceEntity[]; total: number }> {
    const qb = this.repo.createQueryBuilder('invoice');

    if (query.search) {
      qb.andWhere(
        '(invoice.description LIKE :search OR invoice.supplier LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('invoice.status = :status', { status: query.status });
    }

    if (query.dateFrom) {
      qb.andWhere('invoice.issueDate >= :dateFrom', {
        dateFrom: query.dateFrom,
      });
    }

    if (query.dateTo) {
      qb.andWhere('invoice.issueDate <= :dateTo', { dateTo: query.dateTo });
    }

    qb.orderBy('invoice.issueDate', 'DESC');
    qb.skip((query.page - 1) * query.pageSize);
    qb.take(query.pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async getStatusCounts(): Promise<IStatusCounts> {
    const results = await this.repo
      .createQueryBuilder('invoice')
      .select('invoice.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('invoice.status')
      .getRawMany<{ status: string; count: string }>();

    const counts: Record<string, number> = {};
    let all = 0;
    for (const row of results) {
      counts[row.status] = Number(row.count);
      all += Number(row.count);
    }

    return {
      all,
      approved: counts[InvoiceStatus.APPROVED] ?? 0,
      pending: counts[InvoiceStatus.PENDING_APPROVAL] ?? 0,
      inProcess: counts[InvoiceStatus.IN_PROCESS] ?? 0,
      rejected: counts[InvoiceStatus.REJECTED] ?? 0,
    };
  }

  async findById(id: string): Promise<InvoiceEntity | null> {
    return this.repo.findOne({ where: { id } });
  }
}
