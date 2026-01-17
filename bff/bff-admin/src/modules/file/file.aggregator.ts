import { FileServiceClient } from '@gov-ph/bff-core';
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
   * List files with optional filters
   * @param filters - Optional filters for listing files
   * @param token - Optional authorization token
   * @returns Paginated list of files
   */
  async listFiles(
    filters?: ListFilesFilters,
    token?: string
  ): Promise<ListFilesResponse> {
    try {
      const query: any = {
        limit: filters?.limit || 10,
        skip: filters?.offset || 0,
      };

      if (filters?.submissionId) {
        query.ownerType = 'FORM';
        query.ownerId = filters.submissionId;
      }
      if (filters?.incidentId) {
        query.ownerType = 'INCIDENT';
        query.ownerId = filters.incidentId;
      }

      const result = await this.fileClient.listFiles(query, token || '');
      if (!result.success) {
        throw new Error('Failed to fetch files');
      }

      // Map FileEntity to FileMetadata
      const files = (result.data?.files || []).map((file) => ({
        id: file.id || file._id || '',
        fileName: file.filename || '',
        fileSize: file.size || 0,
        mimeType: file.mimeType || '',
        uploadedAt: file.createdAt?.toString() || new Date().toISOString(),
        uploadedBy: file.uploadedBy || '',
        description: file.metadata?.description,
      }));

      return {
        success: true,
        data: files,
        total: result.data?.total || 0,
        limit: filters?.limit || 10,
        offset: filters?.offset || 0,
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
}
