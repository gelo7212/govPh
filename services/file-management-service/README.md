# File Management Service

A dedicated microservice for managing file uploads, storage, and retrieval across the LGU e-Government platform.

## Features

- **Multi-Provider Storage**: Support for LOCAL, S3, and MinIO storage backends
- **File Metadata Tracking**: Comprehensive metadata including ownership, visibility, and expiration
- **Access Control**: Role-based file access with ownership validation
- **Presigned URLs**: For S3/MinIO temporary direct access
- **Soft Delete Support**: Safe file deletion with retention capability
- **Checksum Validation**: File integrity verification

## File Schema

```typescript
{
  id: string                                    // UUID
  filename: string
  mimeType: string
  size: number                                  // bytes
  checksum: string                              // SHA-256
  
  storageProvider: "LOCAL" | "S3" | "MINIO"
  storagePath: string                           // Physical storage location
  
  visibility: "PRIVATE" | "INTERNAL" | "PUBLIC"
  
  metadata: {
    ownerType: "INCIDENT" | "USER" | "DEPARTMENT" | "CITY" | "FOI"
    ownerId: string
  }
  
  uploadedBy: string                            // User ID
  createdAt: Date
  expiresAt?: Date                              // Optional expiration
  deletedAt?: Date                              // For soft deletes
}
```

## API Endpoints

### Upload File
```
POST /api/files/upload
Content-Type: multipart/form-data

Body:
- file: binary
- ownerType: string
- ownerId: string
- visibility?: string (default: PRIVATE)
- expiresAt?: ISO8601 string

Response: { fileId, filename, size, uploadedAt }
```

### Get File Metadata
```
GET /api/files/:fileId

Response: File metadata object
```

### Download File
```
GET /api/files/:fileId/download
Authorization: Bearer {token}

Query params:
- token?: string (presigned token for S3/MinIO)

Response: File binary content
```

### List Files
```
GET /api/files?ownerType=INCIDENT&ownerId=xxx&limit=10&skip=0

Response: { files: File[], total: number }
```

### Delete File
```
DELETE /api/files/:fileId
Authorization: Bearer {token}

Response: { deleted: true }
```

## Usage in Other Microservices

See `@bff-core/file-client` for integration examples.

## Storage Providers

### LOCAL (Development)
- Files stored on disk
- Path: `./uploads`
- No credentials needed

### S3/MinIO (Production)
- Configure via environment variables
- Supports presigned URLs
- Scalable and secure

## Environment Setup

```bash
# Copy example env
cp .env.example .env

# Install dependencies
yarn install

# Run development
yarn dev

# Build for production
yarn build
```
