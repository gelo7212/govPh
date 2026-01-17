import { Request } from 'express';

export interface User {
  userId?: string;
  id: string;
  email?: string;
  role?: string;
  firebaseUid?: string;
  actor?: {
    type: string;
    cityCode: string;
  };
}

/**
 * Request context with user information
 */
export interface RequestContext {
  user?: User;
  requestId: string;
  timestamp: Date;
}

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: Date;
}

export type StorageProvider = 'LOCAL' | 'S3' | 'MINIO';
export type Visibility = 'PRIVATE' | 'INTERNAL' | 'PUBLIC';
export type OwnerType = 'INCIDENT' | 'USER' | 'DEPARTMENT' | 'CITY' | 'FOI' | 'FORM';

export interface FileMetadata {
  ownerType: OwnerType;
  ownerId: string;
}

export interface File {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  checksum: string;
  
  storageProvider: StorageProvider;
  storagePath: string;
  
  visibility: Visibility;
  metadata: FileMetadata;
  
  uploadedBy: string;
  createdAt: Date;
  expiresAt?: Date;
  deletedAt?: Date;
}

export interface UploadFileRequest {
  filename: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
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
