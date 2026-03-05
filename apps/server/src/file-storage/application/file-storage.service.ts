import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileStorageEntity } from '../domain/file-storage.entity';

@Injectable()
export class FileStorageService {
  constructor(
    @InjectRepository(FileStorageEntity)
    private readonly repo: Repository<FileStorageEntity>,
  ) {}

  async findById(id: string): Promise<FileStorageEntity> {
    const record = await this.repo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`File storage record ${id} not found`);
    }
    return record;
  }

  async create(filename: string, fileLocation: string): Promise<FileStorageEntity> {
    const entity = this.repo.create({ filename, fileLocation });
    return this.repo.save(entity);
  }
}
