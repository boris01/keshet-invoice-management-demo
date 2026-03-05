import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileStorageService } from './file-storage.service';
import { FileStorageEntity } from '../domain/file-storage.entity';

const mockRecord: FileStorageEntity = {
  id: 'file-uuid-1',
  filename: 'INV-00001.pdf',
  fileLocation: 'invoices/INV-00001.pdf',
};

describe('FileStorageService', () => {
  let service: FileStorageService;
  let repo: Record<string, jest.Mock>;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: getRepositoryToken(FileStorageEntity),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get(FileStorageService);
  });

  describe('findById', () => {
    it('should return file storage record when found', async () => {
      repo.findOne.mockResolvedValue(mockRecord);

      const result = await service.findById('file-uuid-1');

      expect(result).toEqual(mockRecord);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'file-uuid-1' } });
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a file storage record', async () => {
      repo.create.mockReturnValue(mockRecord);
      repo.save.mockResolvedValue(mockRecord);

      const result = await service.create('INV-00001.pdf', 'invoices/INV-00001.pdf');

      expect(result).toEqual(mockRecord);
      expect(repo.create).toHaveBeenCalledWith({
        filename: 'INV-00001.pdf',
        fileLocation: 'invoices/INV-00001.pdf',
      });
      expect(repo.save).toHaveBeenCalledWith(mockRecord);
    });
  });
});
