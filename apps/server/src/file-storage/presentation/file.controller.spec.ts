import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileController } from './file.controller';
import { FileStorageService } from '../application/file-storage.service';
import { InvoicePdfService } from '../application/invoice-pdf.service';
import {
  STORAGE_PROVIDER,
  IStorageProvider,
} from '../application/storage-provider.interface';
import { InvoiceEntity } from '../../invoice/domain/invoice.entity';

describe('FileController', () => {
  let controller: FileController;
  let fileStorageService: jest.Mocked<FileStorageService>;
  let storageProvider: jest.Mocked<IStorageProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileStorageService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: InvoicePdfService,
          useValue: {
            generate: jest.fn(),
          },
        },
        {
          provide: STORAGE_PROVIDER,
          useValue: {
            getFile: jest.fn(),
            saveFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(InvoiceEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get(FileController);
    fileStorageService = module.get(FileStorageService) as jest.Mocked<FileStorageService>;
    storageProvider = module.get(STORAGE_PROVIDER) as jest.Mocked<IStorageProvider>;
  });

  describe('getFile', () => {
    it('should stream PDF with correct Content-Type', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 fake content');
      fileStorageService.findById.mockResolvedValue({
        id: 'file-uuid-1',
        filename: 'INV-00001.pdf',
        fileLocation: 'invoices/INV-00001.pdf',
      });
      storageProvider.getFile.mockResolvedValue(pdfBuffer);

      const mockRes = {
        set: jest.fn(),
        end: jest.fn(),
      } as any;

      await controller.getFile('file-uuid-1', mockRes);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'application/pdf',
        }),
      );
      expect(mockRes.end).toHaveBeenCalledWith(pdfBuffer);
    });

    it('should include correct Content-Disposition header', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 fake content');
      fileStorageService.findById.mockResolvedValue({
        id: 'file-uuid-1',
        filename: 'INV-00001.pdf',
        fileLocation: 'invoices/INV-00001.pdf',
      });
      storageProvider.getFile.mockResolvedValue(pdfBuffer);

      const mockRes = {
        set: jest.fn(),
        end: jest.fn(),
      } as any;

      await controller.getFile('file-uuid-1', mockRes);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Disposition': 'inline; filename="INV-00001.pdf"',
        }),
      );
    });

    it('should throw NotFoundException when file record not found', async () => {
      fileStorageService.findById.mockRejectedValue(
        new NotFoundException('File storage record file-uuid-999 not found'),
      );

      const mockRes = { set: jest.fn(), end: jest.fn() } as any;

      await expect(controller.getFile('file-uuid-999', mockRes)).rejects.toThrow(NotFoundException);
    });
  });
});
