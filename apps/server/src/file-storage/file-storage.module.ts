import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageEntity } from './domain/file-storage.entity';
import { InvoiceEntity } from '../invoice/domain/invoice.entity';
import { FileStorageService } from './application/file-storage.service';
import { InvoicePdfService } from './application/invoice-pdf.service';
import { LocalDiskProvider } from './infrastructure/local-disk.provider';
import { STORAGE_PROVIDER } from './application/storage-provider.interface';
import { FileController } from './presentation/file.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FileStorageEntity, InvoiceEntity])],
  controllers: [FileController],
  providers: [
    FileStorageService,
    InvoicePdfService,
    { provide: STORAGE_PROVIDER, useClass: LocalDiskProvider },
  ],
  exports: [FileStorageService, InvoicePdfService, STORAGE_PROVIDER],
})
export class FileStorageModule {}
