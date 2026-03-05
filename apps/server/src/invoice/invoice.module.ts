import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity } from './domain/invoice.entity';
import { InvoiceController } from './presentation/invoice.controller';
import { InvoiceService } from './application/invoice.service';
import { InvoiceRepository } from './infrastructure/invoice.repository';
import { InvoiceSeeder } from './infrastructure/invoice.seeder';
import { FileStorageModule } from '../file-storage/file-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity]), FileStorageModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository, InvoiceSeeder],
  exports: [InvoiceService],
})
export class InvoiceModule {}
