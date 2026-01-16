import { FileServiceClient } from '../clients/file.client';
import { File, UploadFileResponse, ListFilesResponse, ListFilesQuery } from './types';

/**
 * File Service Aggregator
 * Utility functions for common file operations
 */
export class FileServiceAggregator {
  private fileClient: FileServiceClient;

  constructor(fileClient: FileServiceClient) {
    this.fileClient = fileClient;
  }

  /**
   * Upload file with validation
   */
  async uploadFileWithValidation(
    formData: FormData,
    maxSizeBytes?: number
  ): Promise<UploadFileResponse> {
    return this.fileClient.uploadFile(formData);
  }

  /**
   * Get files by owner
   */
  async getFilesByOwner(
    ownerType: string,
    ownerId: string
  ): Promise<ListFilesResponse> {
    return this.fileClient.listFiles({
      ownerType: ownerType as any,
      ownerId,
    });
  }

  /**
   * Get files with pagination
   */
  async getFilesWithPagination(
    query: ListFilesQuery
  ): Promise<ListFilesResponse> {
    return this.fileClient.listFiles(query);
  }

  /**
   * Delete file by ID
   */
  async deleteFileById(fileId: string): Promise<void> {
    return this.fileClient.deleteFile(fileId);
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string): Promise<File> {
    return this.fileClient.getFile(fileId);
  }

  /**
   * Calculate total size of files
   */
  calculateTotalSize(files: File[]): number {
    return files.reduce((total, file) => total + file.size, 0);
  }

  /**
   * Group files by mime type
   */
  groupFilesByMimeType(files: File[]): Record<string, File[]> {
    return files.reduce(
      (groups, file) => {
        const type = file.mimeType || 'unknown';
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(file);
        return groups;
      },
      {} as Record<string, File[]>
    );
  }

  /**
   * Filter files by extension
   */
  filterFilesByExtension(files: File[], extensions: string[]): File[] {
    return files.filter((file) => {
      const ext = file.filename.split('.').pop()?.toLowerCase();
      return ext && extensions.includes(ext);
    });
  }

  /**
   * Check if file is image
   */
  isImageFile(file: File): boolean {
    return file.mimeType.startsWith('image/');
  }

  /**
   * Check if file is document
   */
  isDocumentFile(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ];
    return documentTypes.includes(file.mimeType);
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file extension
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
}
