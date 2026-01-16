import * as fs from 'fs/promises';
import * as path from 'path';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('LocalStorageProvider');

export class LocalStorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = process.env.LOCAL_STORAGE_PATH || './uploads';
    this.ensureStorageDirectory();
  }

  private async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      logger.info(`Storage directory ready: ${this.basePath}`);
    } catch (error) {
      logger.error('Failed to create storage directory', error);
      throw error;
    }
  }

  async saveFile(fileId: string, buffer: Buffer, mimeType: string): Promise<string> {
    try {
      // Create subdirectories for organization: uploads/2024-01/file-id
      const date = new Date();
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const dirPath = path.join(this.basePath, yearMonth);

      await fs.mkdir(dirPath, { recursive: true });

      const filePath = path.join(dirPath, fileId);
      await fs.writeFile(filePath, buffer);

      const storagePath = path.relative(this.basePath, filePath);
      
      logger.info(`File saved: ${fileId}`, { 
        path: storagePath,
        size: buffer.length,
      });

      return storagePath;
    } catch (error) {
      logger.error(`Failed to save file: ${fileId}`, error);
      throw error;
    }
  }

  async readFile(storagePath: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.basePath, storagePath);
      
      // Security: prevent path traversal
      const realPath = await fs.realpath(filePath);
      const realBasePath = await fs.realpath(this.basePath);
      
      if (!realPath.startsWith(realBasePath)) {
        throw new Error('Invalid file path');
      }

      const buffer = await fs.readFile(filePath);
      logger.debug(`File read: ${storagePath}`, { size: buffer.length });
      return buffer;
    } catch (error) {
      logger.error(`Failed to read file: ${storagePath}`, error);
      throw error;
    }
  }

  async deleteFile(storagePath: string): Promise<void> {
    try {
      const filePath = path.join(this.basePath, storagePath);
      
      // Security: prevent path traversal
      const realPath = await fs.realpath(filePath);
      const realBasePath = await fs.realpath(this.basePath);
      
      if (!realPath.startsWith(realBasePath)) {
        throw new Error('Invalid file path');
      }

      await fs.unlink(filePath);
      logger.info(`File deleted: ${storagePath}`);
    } catch (error) {
      logger.error(`Failed to delete file: ${storagePath}`, error);
      throw error;
    }
  }
}
