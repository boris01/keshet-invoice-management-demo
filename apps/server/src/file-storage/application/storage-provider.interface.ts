export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export interface IStorageProvider {
  getFile(path: string): Promise<Buffer | null>;
  saveFile(path: string, buffer: Buffer): Promise<void>;
  deleteFile(path: string): Promise<void>;
}
