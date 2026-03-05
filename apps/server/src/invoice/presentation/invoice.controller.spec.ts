import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from '../application/invoice.service';
import { InvoiceEntity } from '../domain/invoice.entity';
import { InvoiceStatus } from '@keshet/shared';

const mockInvoice: InvoiceEntity = {
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
  fileStorage: undefined as any,
};

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let service: jest.Mocked<InvoiceService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: {
            findPaginated: jest.fn(),
            getStatusCounts: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(InvoiceController);
    service = module.get(InvoiceService) as jest.Mocked<InvoiceService>;
  });

  describe('findAll', () => {
    it('should return paginated response', async () => {
      service.findPaginated.mockResolvedValue({
        items: [mockInvoice],
        total: 1,
        page: 1,
        pageSize: 20,
      });

      const result = await controller.findAll({ page: 1, pageSize: 20 });

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });

  describe('getStatusCounts', () => {
    it('should return status counts', async () => {
      const counts = { all: 500, approved: 125, pending: 125, inProcess: 125, rejected: 125 };
      service.getStatusCounts.mockResolvedValue(counts);

      const result = await controller.getStatusCounts();

      expect(result).toEqual(counts);
    });
  });

  describe('getById', () => {
    it('should return invoice when found', async () => {
      service.getById.mockResolvedValue(mockInvoice);

      const result = await controller.getById('uuid-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('uuid-1');
    });

    it('should throw NotFoundException for missing id', async () => {
      service.getById.mockRejectedValue(new NotFoundException('Invoice nonexistent not found'));

      await expect(controller.getById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
