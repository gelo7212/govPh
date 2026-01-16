import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { FileModel } from './files.schema';
import { 
  File, 
  UploadFileRequest, 
  UploadFileResponse,
  ListFilesQuery,
  StorageProvider,
} from '../../types';
import { NotFoundError, ForbiddenError } from '../../errors';
import { createLogger } from '../../utils/logger';
import { StorageService } from './storage/storage.service';

const logger = createLogger('FileService');

export class FileService {
  private storageService: StorageService;

  constructor(storageProvider: StorageProvider = 'LOCAL') {
    this.storageService = new StorageService(storageProvider);
  }

  async uploadFile(request: UploadFileRequest): Promise<UploadFileResponse> {
    const fileId = uuidv4();
    const checksum = this.calculateChecksum(request.buffer);
    
    const storagePath = await this.storageService.saveFile(
      fileId,
      request.buffer,
      request.mimeType
    );

    const fileDoc = await FileModel.create({
      filename: request.filename,
      mimeType: request.mimeType,
      size: request.size,
      checksum,
      storageProvider: this.storageService.getProvider(),
      storagePath,
      visibility: request.visibility || 'PRIVATE',
      metadata: {
        ownerType: request.ownerType,
        ownerId: request.ownerId,
      },
      uploadedBy: request.uploadedBy,
      expiresAt: request.expiresAt,
    });

    logger.info(`File uploaded: ${fileId}`, { 
      filename: request.filename, 
      size: request.size,
      ownerType: request.ownerType,
      ownerId: request.ownerId,
    });

    return {
      fileId: fileDoc._id.toString(),
      filename: fileDoc.filename,
      size: fileDoc.size,
      uploadedAt: fileDoc.createdAt,
    };
  }

  async getFile(fileId: string): Promise<File> {
    const file = await FileModel.findOne({ 
      _id: fileId,
      deletedAt: { $exists: false },
    }).lean();

    if (!file) {
      throw new NotFoundError(`File not found: ${fileId}`);
    }

    // Check if file has expired
    if (file.expiresAt && new Date() > file.expiresAt) {
      throw new NotFoundError(`File has expired: ${fileId}`);
    }

    return this.mapDocumentToFile(file as any);
  }

  async downloadFile(fileId: string, userId: string): Promise<Buffer> {
    const file = await this.getFile(fileId);

    // Authorization check
    if (file.visibility === 'PRIVATE' && file.uploadedBy !== userId) {
      throw new ForbiddenError('You do not have permission to access this file');
    }

    const buffer = await this.storageService.readFile(file.storagePath);
    
    logger.info(`File downloaded: ${fileId}`, { downloadedBy: userId });
    
    return buffer;
  }

  async listFiles(query: ListFilesQuery): Promise<{ files: File[]; total: number }> {
    const filter: any = { deletedAt: { $exists: false } };

    if (query.ownerType) {
      filter['metadata.ownerType'] = query.ownerType;
    }

    if (query.ownerId) {
      filter['metadata.ownerId'] = query.ownerId;
    }

    if (query.visibility) {
      filter.visibility = query.visibility;
    }

    const skip = query.skip || 0;
    const limit = query.limit || 10;

    const [files, total] = await Promise.all([
      FileModel.find(filter).skip(skip).limit(limit).lean(),
      FileModel.countDocuments(filter),
    ]);

    return {
      files: files as File[],
      total,
    };
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.getFile(fileId);

    // Only the uploader can delete
    if (file.uploadedBy !== userId) {
      throw new ForbiddenError('Only the uploader can delete this file');
    }

    // Soft delete
    await FileModel.updateOne(
      { _id: fileId },
      { deletedAt: new Date() }
    );

    // Delete from storage
    try {
      await this.storageService.deleteFile(file.storagePath);
    } catch (error) {
      logger.error(`Failed to delete file from storage: ${fileId}`, error);
    }

    logger.info(`File deleted: ${fileId}`, { deletedBy: userId });
  }

  async deleteExpiredFiles(): Promise<number> {
    const result = await FileModel.updateMany(
      {
        expiresAt: { $lt: new Date() },
        deletedAt: { $exists: false },
      },
      { deletedAt: new Date() }
    );

    logger.info(`Expired files deleted: ${result.modifiedCount}`);
    return result.modifiedCount;
  }

  private calculateChecksum(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private mapDocumentToFile(doc: any): File {
    return {
      id: doc._id?.toString() || doc.id,
      filename: doc.filename,
      mimeType: doc.mimeType,
      size: doc.size,
      checksum: doc.checksum,
      storageProvider: doc.storageProvider,
      storagePath: doc.storagePath,
      visibility: doc.visibility,
      metadata: doc.metadata,
      uploadedBy: doc.uploadedBy,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
      deletedAt: doc.deletedAt,
    };
  }
}

export const fileService = new FileService(
  (process.env.STORAGE_PROVIDER as StorageProvider) || 'LOCAL'
);
