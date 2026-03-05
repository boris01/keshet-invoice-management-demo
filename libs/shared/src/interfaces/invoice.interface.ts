import { InvoiceStatus } from '../enums/invoice-status.enum';

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  description: string;
  supplier: string;
  issueDate: string;
  amountBeforeVat: number;
  vatAmount: number;
  totalAmount: number;
  cost: number;
  fileStorageId: string;
}
