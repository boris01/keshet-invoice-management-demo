import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileService {
  getFileUrl(fileStorageId: string): string {
    return `/api/files/${fileStorageId}`;
  }
}
