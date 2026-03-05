import { Expose, Type } from 'class-transformer';
import { InvoiceResponseDto } from './invoice-response.dto';

export class PaginatedInvoiceResponseDto {
  @Expose()
  @Type(() => InvoiceResponseDto)
  items: InvoiceResponseDto[];

  @Expose() total: number;
  @Expose() page: number;
  @Expose() pageSize: number;
}
