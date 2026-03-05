import { Controller, Get, Inject, Param, Res, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileStorageService } from '../application/file-storage.service';
import { InvoicePdfService } from '../application/invoice-pdf.service';
import {
  STORAGE_PROVIDER,
  IStorageProvider,
} from '../application/storage-provider.interface';
import { InvoiceEntity } from '../../invoice/domain/invoice.entity';

const PDF_CACHE_TTL = 300_000; // 300s in ms

@Controller('files')
export class FileController {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly invoicePdfService: InvoicePdfService,
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepo: Repository<InvoiceEntity>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const fileRecord = await this.fileStorageService.findById(id);
    const cacheKey = `pdf:${id}`;

    // Check cache for PDF buffer
    const cachedData = await this.cache.get<{ buffer: string; filename: string }>(cacheKey);
    if (cachedData) {
      const buffer = Buffer.from(cachedData.buffer, 'base64');
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${cachedData.filename}"`,
        'Content-Length': buffer.length,
      });
      res.end(buffer);
      return;
    }

    let buffer = await this.storageProvider.getFile(fileRecord.fileLocation);

    if (!buffer) {
      // Fallback: regenerate PDF from invoice data
      const invoice = await this.invoiceRepo.findOne({
        where: { fileStorageId: id },
      });
      if (!invoice) {
        throw new NotFoundException(`Invoice for file ${id} not found`);
      }
      buffer = await this.invoicePdfService.generate(invoice);
      await this.storageProvider.saveFile(fileRecord.fileLocation, buffer);
    }

    // Cache as base64 string (Buffer doesn't serialize well to JSON stores)
    await this.cache.set(
      cacheKey,
      { buffer: buffer.toString('base64'), filename: fileRecord.filename },
      PDF_CACHE_TTL,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileRecord.filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
