import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceRepository } from '../infrastructure/invoice.repository';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IPaginatedResponse, IStatusCounts } from '@keshet/shared';
import { InvoiceEntity } from '../domain/invoice.entity';

@Injectable()
export class InvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async findPaginated(
    query: PaginationQueryDto,
  ): Promise<IPaginatedResponse<InvoiceEntity>> {
    const { items, total } = await this.invoiceRepository.findPaginated(query);
    return {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getStatusCounts(): Promise<IStatusCounts> {
    return this.invoiceRepository.getStatusCounts();
  }

  async getById(id: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }
}
