# File Client

Shared client library for integrating file-management-service across microservices.

## Installation

```bash
yarn add @bff-core/file-client
```

## Usage

### Basic Setup

```typescript
import { FileServiceClient } from '@bff-core/file-client';

const fileClient = new FileServiceClient({
  baseURL: 'http://localhost:3006',
  token: 'your-jwt-token',
});

// Or provide a function that returns the token dynamically
const fileClient = new FileServiceClient({
  baseURL: 'http://localhost:3006',
  getToken: () => getCurrentUserToken(),
});
```

### Upload File

```typescript
const formData = new FormData();
formData.append('file', fileBuffer, 'filename.pdf');
formData.append('ownerType', 'INCIDENT');
formData.append('ownerId', 'incident-123');
formData.append('visibility', 'INTERNAL');
formData.append('expiresAt', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

const response = await fileClient.uploadFile(formData);
console.log('File ID:', response.fileId);
```

### Get File Metadata

```typescript
const metadata = await fileClient.getFileMetadata('file-id');
console.log(metadata);
```

### Download File

```typescript
const buffer = await fileClient.downloadFile('file-id');
// Use buffer in your application
```

### List Files

```typescript
const result = await fileClient.listFiles({
  ownerType: 'INCIDENT',
  ownerId: 'incident-123',
  visibility: 'INTERNAL',
  limit: 20,
  skip: 0,
});

console.log(`Total files: ${result.total}`);
result.files.forEach(file => console.log(file.filename));
```

### Delete File

```typescript
await fileClient.deleteFile('file-id');
```

## API Reference

See [types](./src/types.ts) for complete interface definitions.

## Examples

### Identity Service: User Avatar

```typescript
// identity-service/modules/user/user.controller.ts
async uploadAvatar(userId: string, file: Express.Multer.File) {
  const formData = new FormData();
  formData.append('file', file.buffer, file.originalname);
  formData.append('ownerType', 'USER');
  formData.append('ownerId', userId);
  formData.append('visibility', 'PUBLIC');

  const response = await this.fileClient.uploadFile(formData);
  
  // Store fileId in user document
  await User.updateOne(
    { _id: userId },
    { avatarFileId: response.fileId }
  );

  return response;
}
```

### Incident Service: Attach Evidence

```typescript
// incident-service/modules/incident/incident.controller.ts
async attachEvidence(incidentId: string, files: Express.Multer.File[]) {
  const fileIds = await Promise.all(
    files.map(file => {
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);
      formData.append('ownerType', 'INCIDENT');
      formData.append('ownerId', incidentId);
      formData.append('visibility', 'INTERNAL');
      
      return this.fileClient.uploadFile(formData).then(r => r.fileId);
    })
  );

  // Store fileIds in incident document
  await Incident.updateOne(
    { _id: incidentId },
    { $push: { evidenceFileIds: { $each: fileIds } } }
  );

  return fileIds;
}
```
