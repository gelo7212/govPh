import { StorageProvider } from '../../../types';
import { LocalStorageProvider } from './providers/local.provider';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('StorageService');

export class StorageService {
  private provider: any;
  private providerType: StorageProvider;

  constructor(providerType: StorageProvider) {
    this.providerType = providerType;

    switch (providerType) {
      case 'LOCAL':
        this.provider = new LocalStorageProvider();
        break;
      case 'S3':
        // TODO: Implement S3Provider
        throw new Error('S3 storage provider not yet implemented');
      case 'MINIO':
        // TODO: Implement MinIOProvider
        throw new Error('MinIO storage provider not yet implemented');
      default:
        throw new Error(`Unknown storage provider: ${providerType}`);
    }

    logger.info(`Storage provider initialized: ${providerType}`);
  }

  async saveFile(fileId: string, buffer: Buffer, mimeType: string): Promise<string> {
    return this.provider.saveFile(fileId, buffer, mimeType);
  }

  async readFile(storagePath: string): Promise<Buffer> {
    return this.provider.readFile(storagePath);
  }

  async deleteFile(storagePath: string): Promise<void> {
    return this.provider.deleteFile(storagePath);
  }

  getProvider(): StorageProvider {
    return this.providerType;
  }
}
