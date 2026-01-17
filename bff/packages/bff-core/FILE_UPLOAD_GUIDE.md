# File Upload Management - Implementation Guide

## Overview
Implemented complete file upload management system in bff-core following the incident and clients patterns. The system includes a service client, aggregator, and comprehensive type definitions.

## Architecture

### 1. **File Types** (`file/file.types.ts`)
Type definitions aligned with file-management-service:

```typescript
// File Entity
FileEntity {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  checksum: string;
  storageProvider: 'LOCAL' | 'S3' | 'MINIO';
  storagePath: string;
  visibility: 'PRIVATE' | 'INTERNAL' | 'PUBLIC';
  metadata: FileMetadata;
  uploadedBy: string;
  createdAt?: Date;
  expiresAt?: Date;
  deletedAt?: Date;
}

// Owner Types
OwnerType: 'INCIDENT' | 'USER' | 'DEPARTMENT' | 'CITY' | 'FOI' | 'FORM';
```

### 2. **File Service Client** (`clients/file.client.ts`)
HTTP client for file-management-service communication:

#### Core Methods:
- `uploadFile(file: UploadFileRequest)` - Upload new file
- `getFileById(fileId: string)` - Get file metadata
- `downloadFile(fileId: string)` - Download file content
- `listFiles(query: ListFilesQuery)` - List files with filters
- `getFilesByOwner(ownerType, ownerId)` - Get files by owner
- `updateFile(fileId, data)` - Update file metadata
- `updateFileVisibility(fileId, visibility)` - Change visibility
- `deleteFile(fileId, deletedBy)` - Soft delete file
- `deleteFilesByOwner(ownerType, ownerId, deletedBy)` - Batch delete
- `verifyFileChecksum(fileId, checksum)` - Verify integrity

### 3. **File Aggregator** (`file/file.aggregator.ts`)
Orchestration layer for file operations:

#### Base Methods:
All client methods plus helper methods for specific owners:

```typescript
// Helper methods for specific owner types
getIncidentFiles(incidentId)      // INCIDENT owner
getUserFiles(userId)              // USER owner
getDepartmentFiles(departmentId)  // DEPARTMENT owner
getCityFiles(cityId)              // CITY owner
getFormFiles(formId)              // FORM owner
getFOIFiles(foiId)                // FOI owner
```

## Usage Examples

### In BFF Services (bff-citizen, bff-admin)

```typescript
import { FileServiceClient, FileAggregator } from '@gov-ph/bff-core';

// Initialize client
const fileClient = new FileServiceClient(
  process.env.FILE_SERVICE_URL,
  userContext
);

// Create aggregator
const fileAggregator = new FileAggregator(fileClient);

// Upload file for incident
const uploadResult = await fileAggregator.uploadFile({
  filename: 'incident-report.pdf',
  mimeType: 'application/pdf',
  size: 102400,
  buffer: fileBuffer,
  ownerType: 'INCIDENT',
  ownerId: 'incident-123',
  visibility: 'PRIVATE',
  uploadedBy: 'user-456'
});

// Get incident files
const files = await fileAggregator.getIncidentFiles('incident-123');

// Delete file
await fileAggregator.deleteFile(uploadResult.data.fileId, 'user-456');
```

### In Route Handlers

```typescript
// Example: POST /incidents/:id/files
app.post('/incidents/:id/files', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file; // from multer middleware
    
    const fileAggregator = new FileAggregator(
      new FileServiceClient(process.env.FILE_SERVICE_URL, {
        userId: req.user?.id,
        authorization: req.headers.authorization
      })
    );
    
    const result = await fileAggregator.uploadFile({
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
      ownerType: 'INCIDENT',
      ownerId: id,
      visibility: 'INTERNAL',
      uploadedBy: req.user!.id
    });
    
    res.json(result);
  } catch (error) {
    // Handle error
  }
});
```

## Export Structure

### From `@gov-ph/bff-core`:
```typescript
// Clients
export { FileServiceClient }

// Aggregators
export { FileAggregator }

// Types
export type {
  FileEntity,
  UploadFileRequest,
  UploadFileResponse,
  ListFilesQuery,
  DeleteFileRequest,
  DeleteFileResponse,
  FileResponse,
  FilesListResponse,
  FileMetadata,
  StorageProvider,
  Visibility,
  OwnerType
}
```

## Integration Checklist

- [x] File types defined (`file.types.ts`)
- [x] File client implemented (`clients/file.client.ts`)
- [x] File aggregator implemented (`file/file.aggregator.ts`)
- [x] File index created (`file/index.ts`)
- [x] Exports added to main bff-core index
- [ ] Add to bff-citizen routes (e.g., incident file upload)
- [ ] Add to bff-admin routes (e.g., file management endpoints)
- [ ] Add multer middleware for file uploads
- [ ] Add file validation middleware
- [ ] Add tests for file operations

## Next Steps

1. **Integrate in BFF Services:**
   - Add file routes to bff-citizen
   - Add file routes to bff-admin
   - Add multer configuration

2. **Add Middleware:**
   - File validation (size, type, etc.)
   - Virus scanning integration (if needed)
   - Request logging

3. **Add Tests:**
   - Unit tests for FileAggregator
   - Integration tests with file-management-service
   - E2E tests for file upload workflows

4. **Documentation:**
   - API documentation for file endpoints
   - Storage provider configuration guide
   - File lifecycle management guide
