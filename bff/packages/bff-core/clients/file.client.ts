/**
 * File Service Client
 * Shared client for communicating with the file-management-service
 */
import { BaseClient, type UserContext } from './base.client';
import {
  FileEntity,
  UploadFileRequest,
  UploadFileResponse,
  ListFilesQuery,
  DeleteFileRequest,
  DeleteFileResponse,
  FileResponse,
  FilesListResponse,
} from '../file/file.types';

export class FileServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
  }

  // ==================== File Endpoints ====================

  /**
   * Upload a new file
   * @param file - The file to upload with metadata
   */
  async uploadFile(file: UploadFileRequest, token: string): Promise<FileResponse<UploadFileResponse>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const formData = new FormData();
      
      if (file.buffer) {
        const blob = new Blob([file.buffer], { type: file.mimeType });
        formData.append('file', blob, file.filename);
      }
      
      formData.append('filename', file.filename);
      formData.append('mimeType', file.mimeType);
      formData.append('size', file.size.toString());
      formData.append('ownerType', file.ownerType);
      formData.append('ownerId', file.ownerId);
      formData.append('uploadedBy', file.uploadedBy);
      
      if (file.visibility) {
        formData.append('visibility', file.visibility);
      }
      if (file.expiresAt) {
        formData.append('expiresAt', file.expiresAt.toString());
      }

      const response = await this.client.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string, token: string): Promise<FileResponse<FileEntity>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.get(`/api/files/${fileId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get file by ID for download
   */
  async downloadFile(fileId: string, token: string): Promise<ArrayBuffer> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.get(`/api/files/${fileId}/download`, {
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * List files with filtering and pagination
   */
  async listFiles(query: ListFilesQuery, token: string): Promise<FilesListResponse> {
    try {

      if (token) {
        this.setUserContext({ authorization: token });
      }
      const params: any = {};
      
      if (query.ownerType) params.ownerType = query.ownerType;
      if (query.ownerId) params.ownerId = query.ownerId;
      if (query.visibility) params.visibility = query.visibility;
      if (query.limit) params.limit = query.limit;
      if (query.skip) params.skip = query.skip;

      const response = await this.client.get('/api/files', { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get files by owner
   */
  async getFilesByOwner(
    ownerType: string,
    ownerId: string,
    limit: number = 50,
    skip: number = 0,
    token: string
  ): Promise<FilesListResponse> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.get(`/api/files/owner/${ownerType}/${ownerId}`, {
        params: { limit, skip },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update file metadata
   */
  async updateFile(fileId: string, data: Partial<FileEntity>, token: string): Promise<FileResponse<FileEntity>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.patch(`/api/files/${fileId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update file visibility
   */
  async updateFileVisibility(fileId: string, visibility: string, token: string): Promise<FileResponse<FileEntity>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.patch(`/api/files/${fileId}/visibility`, { visibility });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string, deletedBy: string, token: string): Promise<FileResponse<DeleteFileResponse>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.delete(`/api/files/${fileId}`, {
        data: { deletedBy },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Batch delete files by owner
   */
  async deleteFilesByOwner(
    ownerType: string,
    ownerId: string,
    deletedBy: string,
    token: string
  ): Promise<FileResponse<{ deleted: number }>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.delete(`/api/files/owner/${ownerType}/${ownerId}`, {
        data: { deletedBy },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Verify file checksum
   */
  async verifyFileChecksum(fileId: string, checksum: string, token: string): Promise<FileResponse<{ valid: boolean }>> {
    try {
      if (token) {
        this.setUserContext({ authorization: token });
      }
      const response = await this.client.post(`/api/files/${fileId}/verify`, { checksum });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
