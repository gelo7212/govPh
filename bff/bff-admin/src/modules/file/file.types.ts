/**
 * File Module Types
 * Type definitions for file metadata and download operations
 */

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  submissionId?: string;
  incidentId?: string;
  tags?: string[];
}

export interface FileMetadataResponse {
  success: boolean;
  data: FileMetadata;
  message?: string;
}

export interface FileDownloadResponse {
  success: boolean;
  data: {
    fileId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    downloadUrl: string;
    expiresAt?: string;
  };
  message?: string;
}

export interface ListFilesFilters {
  submissionId?: string;
  incidentId?: string;
  uploadedBy?: string;
  limit?: number;
  offset?: number;
}

export interface ListFilesResponse {
  success: boolean;
  data: FileMetadata[];
  total: number;
  limit: number;
  offset: number;
}
