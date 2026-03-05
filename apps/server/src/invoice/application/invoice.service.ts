import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InvoiceRepository } from '../infrastructure/invoice.repository';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IPaginatedResponse, IStatusCounts } from '@keshet/shared';
import { InvoiceEntity } from '../domain/invoice.entity';

const INVOICE_LIST_TTL = 60_000; // 60s in ms
const STATUS_COUNTS_TTL = 60_000; // 60s in ms

@Injectable()
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findPaginated(
    query: PaginationQueryDto,
  ): Promise<IPaginatedResponse<InvoiceEntity>> {
    const cacheKey = `invoices:page:${query.page}:size:${query.pageSize}:status:${query.status ?? ''}:search:${query.search ?? ''}`;

    const cached = await this.cache.get<IPaginatedResponse<InvoiceEntity>>(cacheKey);
    if (cached) {
      return cached;
    }

    const { items, total } = await this.invoiceRepository.findPaginated(query);
    const result: IPaginatedResponse<InvoiceEntity> = {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
    };

    await this.cache.set(cacheKey, result, INVOICE_LIST_TTL);
    return result;
  }

  async getStatusCounts(): Promise<IStatusCounts> {
    const cacheKey = 'invoice-status-counts';

    const cached = await this.cache.get<IStatusCounts>(cacheKey);
    if (cached) {
      return cached;
    }

    const counts = await this.invoiceRepository.getStatusCounts();
    await this.cache.set(cacheKey, counts, STATUS_COUNTS_TTL);
    return counts;
  }

  async getById(id: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }
}
