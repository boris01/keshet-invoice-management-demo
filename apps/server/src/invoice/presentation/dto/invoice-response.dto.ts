import { Expose } from 'class-transformer';
import { InvoiceStatus } from '@keshet/shared';

export class InvoiceResponseDto {
  @Expose() id: string;
  @Expose() invoiceNumber: string;
  @Expose() status: InvoiceStatus;
  @Expose() description: string;
  @Expose() supplier: string;
  @Expose() issueDate: string;
  @Expose() amountBeforeVat: number;
  @Expose() vatAmount: number;
  @Expose() totalAmount: number;
  @Expose() cost: number;
  @Expose() fileStorageId: string;
}
