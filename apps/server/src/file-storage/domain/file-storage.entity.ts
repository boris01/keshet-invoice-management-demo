import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('file_storage')
export class FileStorageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  fileLocation: string;
}
