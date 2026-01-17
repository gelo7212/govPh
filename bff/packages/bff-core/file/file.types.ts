/**
 * File Service Type Definitions
 */

// ==================== File Types ====================

export type StorageProvider = 'LOCAL' | 'S3' | 'MINIO';
export type Visibility = 'PRIVATE' | 'INTERNAL' | 'PUBLIC';
export type OwnerType = 'INCIDENT' | 'USER' | 'DEPARTMENT' | 'CITY' | 'FOI' | 'FORM';

export interface FileMetadata {
  ownerType: OwnerType;
  ownerId: string;
  [key: string]: any;
}

export interface FileEntity {
  id?: string;
  _id?: string;
  filename: string;
  mimeType: string;
  size: number;
  checksum: string;
  
  storageProvider: StorageProvider;
  storagePath: string;
  
  visibility: Visibility;
  metadata: FileMetadata;
  
  uploadedBy: string;
  createdAt?: Date;
  expiresAt?: Date;
  deletedAt?: Date;
}

export interface UploadFileRequest {
  filename: string;
  mimeType: string;
  size: number;
  buffer?: Buffer;
  ownerType: OwnerType;
  ownerId: string;
  visibility?: Visibility;
  expiresAt?: Date;
  uploadedBy: string;
}

export interface UploadFileResponse {
  fileId: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

export interface ListFilesQuery {
  ownerType?: OwnerType;
  ownerId?: string;
  visibility?: Visibility;
  limit?: number;
  skip?: number;
}

export interface DeleteFileRequest {
  fileId: string;
  deletedBy: string;
}

export interface DeleteFileResponse {
  fileId: string;
  deleted: boolean;
  deletedAt: Date;
}

export interface FileResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp?: Date;
}

export interface FilesListResponse {
  success: boolean;
  data: {
    files: FileEntity[];
    total: number;
    limit: number;
    skip: number;
  };
  timestamp?: Date;
}

export interface FileServiceClientConfig {
  baseURL: string;
  userContext?: {
    userId: string;
    authToken: string;
  };
}