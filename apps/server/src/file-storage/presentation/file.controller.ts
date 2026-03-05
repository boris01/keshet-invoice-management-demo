import { Controller, Get, Inject, Param, Res, NotFoundException } from '@nestjs/common';
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

@Controller('files')
export class FileController {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly invoicePdfService: InvoicePdfService,
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepo: Repository<InvoiceEntity>,
  ) {}

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const fileRecord = await this.fileStorageService.findById(id);

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

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileRecord.filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
