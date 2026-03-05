import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from '../infrastructure/invoice.repository';
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

describe('InvoiceService', () => {
  let service: InvoiceService;
  let repo: jest.Mocked<InvoiceRepository>;
  let cache: Record<string, jest.Mock>;

  beforeEach(async () => {
    cache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: InvoiceRepository,
          useValue: {
            findPaginated: jest.fn(),
            getStatusCounts: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: cache,
        },
      ],
    }).compile();

    service = module.get(InvoiceService);
    repo = module.get(InvoiceRepository) as jest.Mocked<InvoiceRepository>;
  });

  describe('findPaginated', () => {
    it('should return paginated data from repository', async () => {
      repo.findPaginated.mockResolvedValue({ items: [mockInvoice], total: 1 });

      const result = await service.findPaginated({ page: 1, pageSize: 20 });

      expect(result).toEqual({
        items: [mockInvoice],
        total: 1,
        page: 1,
        pageSize: 20,
      });
      expect(repo.findPaginated).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
    });

    it('should return cached data when available', async () => {
      const cached = { items: [mockInvoice], total: 1, page: 1, pageSize: 20 };
      cache.get.mockResolvedValue(cached);

      const result = await service.findPaginated({ page: 1, pageSize: 20 });

      expect(result).toEqual(cached);
      expect(repo.findPaginated).not.toHaveBeenCalled();
    });
  });

  describe('getStatusCounts', () => {
    it('should return status counts from repository', async () => {
      const counts = { all: 500, approved: 125, pending: 125, inProcess: 125, rejected: 125 };
      repo.getStatusCounts.mockResolvedValue(counts);

      const result = await service.getStatusCounts();

      expect(result).toEqual(counts);
      expect(repo.getStatusCounts).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return invoice when found', async () => {
      repo.findById.mockResolvedValue(mockInvoice);

      const result = await service.getById('uuid-1');

      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
