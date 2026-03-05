import { InvoicePdfService } from './invoice-pdf.service';
import { InvoiceStatus, IInvoice } from '@keshet/shared';

const mockInvoice: IInvoice = {
  id: 'uuid-1',
  invoiceNumber: 'INV-00001',
  status: InvoiceStatus.APPROVED,
  description: 'Test invoice',
  supplier: 'Globex',
  issueDate: '2025-01-15',
  amountBeforeVat: 1000,
  vatAmount: 170,
  totalAmount: 1170,
  cost: 1170,
  fileStorageId: 'file-uuid-1',
};

describe('InvoicePdfService', () => {
  let service: InvoicePdfService;

  beforeEach(() => {
    service = new InvoicePdfService();
  });

  it('should generate a Buffer', async () => {
    const buffer = await service.generate(mockInvoice);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should generate a valid PDF (starts with %PDF)', async () => {
    const buffer = await service.generate(mockInvoice);
    const header = buffer.subarray(0, 5).toString('ascii');
    expect(header).toBe('%PDF-');
  });

  it('should produce a larger PDF for rejected invoices (watermark)', async () => {
    const approvedBuffer = await service.generate(mockInvoice);

    const rejectedInvoice: IInvoice = {
      ...mockInvoice,
      status: InvoiceStatus.REJECTED,
    };
    const rejectedBuffer = await service.generate(rejectedInvoice);

    expect(rejectedBuffer.length).toBeGreaterThan(approvedBuffer.length);
  });
});
