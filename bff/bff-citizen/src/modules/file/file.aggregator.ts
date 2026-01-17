import { FileResponse, FileServiceClient, UploadFileRequest, UploadFileResponse } from '@gov-ph/bff-core';
import {
  FileMetadata,
  FileMetadataResponse,
  FileDownloadResponse,
  ListFilesFilters,
  ListFilesResponse,
} from './file.types';

/**
 * Admin File Module Aggregator
 * Handles file metadata viewing and download operations
 */
export class AdminFileAggregator {
  private fileClient: FileServiceClient;

  constructor(fileClient: FileServiceClient) {
    this.fileClient = fileClient;
  }

  /**
   * Get file metadata by ID
   * @param fileId - The file ID
   * @param token - Optional authorization token
   * @returns File metadata
   */
  async getFileMetadata(
    fileId: string,
    token?: string
  ): Promise<FileMetadataResponse> {
    try {
      const result = await this.fileClient.getFileById(fileId, token || '');
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch file metadata');
      }
      return {
        success: true,
        data: result.data as any,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get download URL for a file
   * @param fileId - The file ID
   * @param token - Optional authorization token
   * @returns Download URL and file information
   */
  async getFileDownloadUrl(
    fileId: string,
    token?: string
  ): Promise<FileDownloadResponse> {
    try {
      const result = await this.fileClient.getFileById(fileId, token || '');
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to generate download URL');
      }

      const file = result.data;
      return {
        success: true,
        data: {
          fileId: file?.id || file?._id || '',
          fileName: file?.filename || '',
          fileSize: file?.size || 0,
          mimeType: file?.mimeType || '',
          downloadUrl: `/api/files/${file?.id || file?._id}/download`,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download file by ID
   * @param fileId - The file ID
   * @param token - Optional authorization token
   * @returns File data for download
  */
  async downloadFileById(
    fileId: string,
    token?: string
  ): Promise<{ fileName: string; mimeType: string; fileBuffer: Buffer } | null> {
    try {
      // First get file metadata
      const metadata = await this.fileClient.getFileById(fileId, token || '');
      if (!metadata.success || !metadata.data) {
        return null;
      }

      const file = metadata.data;
      
      // Then download the file
      const fileBuffer = await this.fileClient.downloadFile(fileId, token || '');
      
      return {
        fileName: file.filename || '',
        mimeType: file.mimeType || 'application/octet-stream',
        fileBuffer: Buffer.from(fileBuffer),
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Upload a new file
  */
  async uploadFile(file: UploadFileRequest, token: string): Promise<FileResponse<UploadFileResponse>> {
    const result = await this.fileClient.uploadFile(file, token);
    return result;
  }
}
