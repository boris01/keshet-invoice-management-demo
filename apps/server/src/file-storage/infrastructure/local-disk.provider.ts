import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { IStorageProvider } from '../application/storage-provider.interface';

@Injectable()
export class LocalDiskProvider implements IStorageProvider {
  private readonly storageDir = path.join(process.cwd(), 'storage');

  async getFile(filePath: string): Promise<Buffer | null> {
    const fullPath = path.join(this.storageDir, filePath);
    try {
      return fs.readFileSync(fullPath);
    } catch {
      return null;
    }
  }

  async saveFile(filePath: string, buffer: Buffer): Promise<void> {
    const fullPath = path.join(this.storageDir, filePath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, buffer);
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.storageDir, filePath);
    try {
      fs.unlinkSync(fullPath);
    } catch {
      // ignore ENOENT
    }
  }
}
