/**
 * File Aggregator - Shared orchestration layer
 * Handles file management across all BFF services
 */
import { FileServiceClient } from '../clients';
import {
  FileEntity,
  UploadFileRequest,
  UploadFileResponse,
  ListFilesQuery,
  DeleteFileRequest,
  DeleteFileResponse,
  FileResponse,
  FilesListResponse,
} from './file.types';

export class FileAggregator {
  constructor(private fileClient: FileServiceClient) {}

  // ==================== File Operations ====================

  /**
   * Upload a new file
   */
  async uploadFile(file: UploadFileRequest, token: string): Promise<FileResponse<UploadFileResponse>> {
    const result = await this.fileClient.uploadFile(file, token);
    return result;
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string, token: string): Promise<FileResponse<FileEntity>> {
    const file = await this.fileClient.getFileById(fileId, token);
    return file;
  }

  /**
   * Download file
   */
  async downloadFile(fileId: string, token: string): Promise<ArrayBuffer> {
    const file = await this.fileClient.downloadFile(fileId, token);
    return file;
  }

  /**
   * List files with filtering
   */
  async listFiles(query: ListFilesQuery, token: string): Promise<FilesListResponse> {
    const files = await this.fileClient.listFiles(query, token);
    return files;
  }

  /**
   * Get files by owner
   */
  async getFilesByOwner(
    ownerType: string,
    ownerId: string,
    limit?: number,
    skip?: number,
    token?: string
  ): Promise<FilesListResponse> {
    const files = await this.fileClient.getFilesByOwner(ownerType, ownerId, limit, skip, token || '');
    return files;
  }

  /**
   * Update file metadata
   */
  async updateFile(fileId: string, data: Partial<FileEntity>, token: string): Promise<FileResponse<FileEntity>> {
    const result = await this.fileClient.updateFile(fileId, data, token);
    return result;
  }

  /**
   * Update file visibility
   */
  async updateFileVisibility(fileId: string, visibility: string, token: string): Promise<FileResponse<FileEntity>> {
    const result = await this.fileClient.updateFileVisibility(fileId, visibility, token);
    return result;
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string, deletedBy: string, token: string): Promise<FileResponse<DeleteFileResponse>> {
    const result = await this.fileClient.deleteFile(fileId, deletedBy, token);
    return result;
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
    const result = await this.fileClient.deleteFilesByOwner(ownerType, ownerId, deletedBy, token);
    return result;
  }

  /**
   * Verify file checksum
   */
  async verifyFileChecksum(fileId: string, checksum: string, token: string): Promise<FileResponse<{ valid: boolean }>> {
    const result = await this.fileClient.verifyFileChecksum(fileId, checksum, token);
    return result;
  }

  /**
   * Get files for incident
   */
  async getIncidentFiles(incidentId: string, token: string): Promise<FilesListResponse> {
    return this.getFilesByOwner('INCIDENT', incidentId, undefined, undefined, token);
  }

  /**
   * Get files for user
   */
  async getUserFiles(userId: string, limit?: number, skip?: number, token?: string): Promise<FilesListResponse> {
    return this.getFilesByOwner('USER', userId, limit, skip, token || '');
  }

  /**
   * Get files for department
   */
  async getDepartmentFiles(departmentId: string, limit?: number, skip?: number, token?: string): Promise<FilesListResponse> {
    return this.getFilesByOwner('DEPARTMENT', departmentId, limit, skip, token || '');
  }

  /**
   * Get files for city
   */
  async getCityFiles(cityId: string, limit?: number, skip?: number, token?: string): Promise<FilesListResponse> {
    return this.getFilesByOwner('CITY', cityId, limit, skip, token || '');
  }

  /**
   * Get files for form submission
   */
  async getFormFiles(formId: string, limit?: number, skip?: number, token?: string): Promise<FilesListResponse> {
    return this.getFilesByOwner('FORM', formId, limit, skip, token || '');
  }

  /**
   * Get files for FOI request
   */
  async getFOIFiles(foiId: string, limit?: number, skip?: number, token?: string): Promise<FilesListResponse> {
    return this.getFilesByOwner('FOI', foiId, limit, skip, token || '');
  }
}
