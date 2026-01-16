# File Storage Guide

## Storage Providers

### 1. LOCAL Storage (Current - for development)

**Configuration:**
```env
STORAGE_PROVIDER=LOCAL
LOCAL_STORAGE_PATH=/app/uploads
```

**Storage Structure:**
```
/app/uploads/
├── 2024-01/
│   ├── file-uuid-1
│   ├── file-uuid-2
│   └── ...
├── 2024-02/
│   └── ...
```

**Docker Persistence:**
- Files are stored in a Docker named volume
- Volume persists across container restarts
- Volume is shared across all instances if scaled

**Access:**
```bash
# View uploaded files from host
docker exec file-management-service ls -la /app/uploads/

# Copy files from container
docker cp file-management-service:/app/uploads ./local-backup
```

### 2. S3 Storage (Future - for production)

```env
STORAGE_PROVIDER=S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET=gov-ph-files
```

**Benefits:**
- Unlimited scalability
- Automatic replication
- Better security
- Multi-region support

### 3. MinIO Storage (Alternative - on-premise S3-compatible)

```env
STORAGE_PROVIDER=MINIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=gov-ph-files
```

**Benefits:**
- S3-compatible API
- Self-hosted solution
- Good for on-premise deployments

## File Lifecycle

### Upload → Storage
1. Client sends file with metadata
2. Service calculates SHA-256 checksum
3. File stored with UUID naming in year-month subdirectory
4. Metadata stored in MongoDB

### Download → Access
1. Client requests file by fileId
2. Service validates access permissions
3. Service retrieves file from storage
4. File streamed to client

### Deletion → Cleanup
1. Soft delete: `deletedAt` timestamp added to metadata
2. Physical file deleted from storage (async)
3. Automatic cleanup of expired files via background job

## Backup Strategy

### Backup Volume
```bash
# Backup uploads
docker run --rm -v file_uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# Restore uploads
docker run --rm -v file_uploads:/data -v $(pwd):/backup \
  alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

### Cleanup Old Files
```bash
# In production, implement scheduled cleanup:
# - Files older than 90 days with deletedAt
# - Files past expiresAt date
# - Orphaned files (no parent document)
```

## Production Recommendations

1. **Use S3 or MinIO** for file storage
2. **Implement CDN** for file downloads
3. **Enable versioning** on S3
4. **Set lifecycle policies** for automatic cleanup
5. **Monitor storage quota** and costs
6. **Encrypt files at rest** (S3 encryption)
7. **Use signed URLs** for secure temporary access
