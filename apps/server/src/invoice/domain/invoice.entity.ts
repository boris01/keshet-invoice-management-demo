import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InvoiceStatus } from '@keshet/shared';
import { FileStorageEntity } from '../../file-storage/domain/file-storage.entity';

@Entity('invoices')
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNumber: string;

  @Column({ type: 'varchar' })
  status: InvoiceStatus;

  @Column()
  description: string;

  @Column()
  supplier: string;

  @Column()
  issueDate: string;

  @Column({ type: 'real' })
  amountBeforeVat: number;

  @Column({ type: 'real' })
  vatAmount: number;

  @Column({ type: 'real' })
  totalAmount: number;

  @Column({ type: 'real' })
  cost: number;

  @Column()
  fileStorageId: string;

  @ManyToOne(() => FileStorageEntity)
  @JoinColumn({ name: 'fileStorageId' })
  fileStorage: FileStorageEntity;
}
