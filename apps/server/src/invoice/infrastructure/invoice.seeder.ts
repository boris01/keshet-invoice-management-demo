import { Injectable, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from '../domain/invoice.entity';
import { FileStorageService } from '../../file-storage/application/file-storage.service';
import { InvoicePdfService } from '../../file-storage/application/invoice-pdf.service';
import {
  STORAGE_PROVIDER,
  IStorageProvider,
} from '../../file-storage/application/storage-provider.interface';
import { InvoiceStatus } from '@keshet/shared';

const SUPPLIERS = [
  'Globex',
  'SkyBridge Tech',
  'DataStream',
  'Veridian Dynamics',
  'Umbrella Ltd',
  'Soylent Corp',
  'Wayne Enterprises',
  'TechNovus',
  'InfraCore',
  'NetPulse',
  'Nakatomi Corp',
  'Initech',
  'Cyberdyne',
  'Massive Dynamic',
];

const DESCRIPTIONS = [
  'Mobile app maintenance',
  'Server hardware upgrade',
  'Data analytics platform',
  'Office renovation',
  'Cybersecurity solutions',
  'Web development project',
  'Equipment leasing',
  'Security audit services',
  'Customer support tools',
  'Design and branding',
  'Legal consulting fees',
  'Network infrastructure',
  'ERP system module',
  'R&D equipment purchase',
];

const STATUSES: InvoiceStatus[] = [
  InvoiceStatus.APPROVED,
  InvoiceStatus.PENDING_APPROVAL,
  InvoiceStatus.IN_PROCESS,
  InvoiceStatus.REJECTED,
];

@Injectable()
export class InvoiceSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(InvoiceSeeder.name);

  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepo: Repository<InvoiceEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly invoicePdfService: InvoicePdfService,
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const existing = await this.invoiceRepo.count();
    if (existing > 0) {
      this.logger.log('Invoices already seeded, skipping.');
      return;
    }

    this.logger.log('Seeding 500 invoices...');

    for (let i = 0; i < 500; i++) {
      const invoiceNumber = `INV-${String(i + 1).padStart(5, '0')}`;
      const status = STATUSES[i % STATUSES.length];
      const supplier = SUPPLIERS[i % SUPPLIERS.length];
      const description = DESCRIPTIONS[i % DESCRIPTIONS.length];
      const issueDate = randomDate();
      const amountBeforeVat = Math.round((Math.random() * 595000 + 5000) * 100) / 100;
      const vatAmount = Math.round(amountBeforeVat * 0.17 * 100) / 100;
      const totalAmount = Math.round((amountBeforeVat + vatAmount) * 100) / 100;
      const cost = totalAmount;

      const filename = `${invoiceNumber}.pdf`;
      const fileLocation = `invoices/${filename}`;

      const fileStorage = await this.fileStorageService.create(
        filename,
        fileLocation,
      );

      const invoice = this.invoiceRepo.create({
        invoiceNumber,
        status,
        description,
        supplier,
        issueDate,
        amountBeforeVat,
        vatAmount,
        totalAmount,
        cost,
        fileStorageId: fileStorage.id,
      });

      const saved = await this.invoiceRepo.save(invoice);

      const pdfBuffer = await this.invoicePdfService.generate(saved);
      await this.storageProvider.saveFile(fileLocation, pdfBuffer);

      if ((i + 1) % 100 === 0) {
        this.logger.log(`Seeded ${i + 1}/500 invoices`);
      }
    }

    this.logger.log('Seeding complete.');
  }
}

function randomDate(): string {
  const start = new Date(2022, 0, 1).getTime();
  const end = new Date(2026, 11, 31).getTime();
  const date = new Date(start + Math.random() * (end - start));
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
