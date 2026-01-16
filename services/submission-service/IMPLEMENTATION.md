# Submission Service - Implementation Guide

## Overview

The `submission-service` is a microservice responsible for managing form schemas, submissions, drafts, and validations within the LGU e-Government platform.

## Project Structure

```
submission-service/
├── src/
│   ├── modules/
│   │   ├── schemas/              # Form schema management
│   │   │   ├── schemas.mongo.schema.ts    # MongoDB schema definition
│   │   │   ├── schemas.service.ts         # Business logic
│   │   │   ├── schemas.routes.ts          # API routes
│   │   │   └── index.ts                   # Module exports
│   │   │
│   │   ├── submissions/          # Form submission handling
│   │   │   ├── submissions.mongo.schema.ts
│   │   │   ├── submissions.service.ts
│   │   │   ├── submissions.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── drafts/               # Draft submission management
│   │   │   ├── drafts.mongo.schema.ts
│   │   │   ├── drafts.service.ts
│   │   │   ├── drafts.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   └── validations/          # Form validation logic
│   │       ├── validations.service.ts
│   │       ├── validations.routes.ts
│   │       └── index.ts
│   │
│   ├── config/
│   │   └── database.ts           # MongoDB connection
│   │
│   ├── errors/
│   │   └── index.ts              # Custom error classes
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── requestLogger.middleware.ts
│   │   └── schema.validator.middleware.ts
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   │
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validators.ts
│   │
│   ├── app.ts                    # Express app initialization
│   └── server.ts                 # Server entry point
│
├── package.json
├── tsconfig.json
├── .env.example
├── Dockerfile
└── README.md
```

## API Endpoints

### Schemas Module

#### List Form Schemas
```http
GET /api/schemas?status=PUBLISHED&skip=0&limit=20
Response: { items: FormSchema[], meta: { page, pageSize, total, totalPages } }
```

#### Get Form Schema
```http
GET /api/schemas/:id
Response: FormSchema
```

#### Create Form Schema
```http
POST /api/schemas
Body: {
  "formKey": "employment_form",
  "title": "Employment Information",
  "description": "Please answer the following questions.",
  "fields": []
}
Response: FormSchema
```

#### Update Form Schema
```http
PUT /api/schemas/:id
Body: { title?, description?, fields? }
Response: FormSchema
```

#### Delete Form Schema
```http
DELETE /api/schemas/:id
Response: { id }
```

#### Publish Form Schema
```http
POST /api/schemas/:id/publish
Response: FormSchema (with status='PUBLISHED')
```

### Submissions Module

#### List Submissions
```http
GET /api/submissions?schemaId=:id&status=SUBMITTED&skip=0&limit=20
Response: { items: Submission[], meta: { page, pageSize, total, totalPages } }
```

#### Get Submission
```http
GET /api/submissions/:id
Response: Submission
```

#### Create Submission
```http
POST /api/submissions
Body: {
  "schemaId": ":id",
  "formKey": "employment_form",
  "data": { field1: "value1", ... }
}
Response: Submission
```

#### Update Submission
```http
PUT /api/submissions/:id
Body: { status?, data?, notes? }
Response: Submission
```

#### Delete Submission
```http
DELETE /api/submissions/:id
Response: { id }
```

### Drafts Module

#### List Drafts
```http
GET /api/drafts?schemaId=:id&skip=0&limit=20
Response: { items: Draft[], meta: { page, pageSize, total, totalPages } }
```

#### Get Draft
```http
GET /api/drafts/:id
Response: Draft
```

#### Save Draft
```http
POST /api/drafts
Body: {
  "schemaId": ":id",
  "formKey": "employment_form",
  "data": { field1: "value1", ... }
}
Response: Draft
```

#### Update Draft
```http
PUT /api/drafts/:id
Body: { data }
Response: Draft
```

#### Delete Draft
```http
DELETE /api/drafts/:id
Response: { id }
```

### Validations Module

#### Validate Form Data
```http
POST /api/validations/validate
Body: {
  "schemaId": ":id",
  "data": { field1: "value1", ... }
}
Response: {
  "isValid": boolean,
  "data": object,
  "errors": {}
}
```

## Data Models

### FormSchema
```typescript
{
  _id: ObjectId;
  formKey: string;          // Unique identifier for form
  version: number;          // Schema version
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  title: string;            // Form title
  description?: string;     // Form description
  fields: FormField[];      // Array of form fields
  createdAt: Date;
  createdBy?: string;       // User ID who created
  updatedAt: Date;
  updatedBy?: string;       // User ID who last updated
  publishedAt?: Date;       // Publication timestamp
}
```

### FormField
```typescript
{
  id: string;               // Unique field ID
  type: string;             // Field type (text, email, number, etc.)
  label: string;            // Display label
  required: boolean;        // Is field required
  placeholder?: string;     // Placeholder text
  default?: any;            // Default value
  options?: Array;          // Options for select/radio/checkbox
  validation?: object;      // Custom validation rules
  ui?: object;              // UI configuration
  meta?: object;            // Metadata
  visibility?: object;      // Conditional visibility rules
}
```

### Submission
```typescript
{
  _id: ObjectId;
  schemaId: string;         // Reference to schema
  formKey: string;          // Form key
  data: object;             // Form submission data
  status: 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  createdBy?: string;       // Submitter ID
  updatedAt: Date;
  updatedBy?: string;
  reviewedAt?: Date;
  reviewedBy?: string;      // Reviewer ID
  notes?: string;           // Review notes
}
```

### Draft
```typescript
{
  _id: ObjectId;
  schemaId: string;         // Reference to schema
  formKey: string;          // Form key
  data: object;             // Partial form data
  createdAt: Date;
  createdBy?: string;       // Creator ID
  updatedAt: Date;
  updatedBy?: string;
  expiresAt: Date;          // Auto-deletion date (30 days)
}
```

## Error Handling

The service uses custom error classes for consistent error handling:

- `ValidationError` - Input validation errors (400)
- `SchemaNotFoundError` - Schema not found (404)
- `SubmissionNotFoundError` - Submission not found (404)
- `DraftNotFoundError` - Draft not found (404)
- `SchemaAlreadyPublishedError` - Cannot update published schema (409)
- `DatabaseError` - Database operation errors (500)
- `ExternalServiceError` - External service errors (502)

## Environment Variables

```env
# Server
PORT=3006
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/submission-service
MONGODB_URI_OPTIONS=retryWrites=true&w=majority

# Service URLs
IDENTITY_SERVICE_URL=http://localhost:3001
CITY_SERVICE_URL=http://localhost:3002

# Logging
LOG_LEVEL=debug
```

## Development

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

## Integration with Frontend

The service follows the API integration pattern described in the provided template. The frontend can:

1. **Create/Manage Forms** - Use schemas endpoints to create and publish forms
2. **Submit Forms** - Use submissions endpoint to submit form responses
3. **Save Drafts** - Use drafts endpoint for auto-saving incomplete forms
4. **Validate** - Use validations endpoint to validate form data before submission

### Frontend API Client Example

```typescript
const formApiClient = {
  // Schemas
  async getSchemaById(id: string) {
    return fetch(`/api/schemas/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
  },

  // Submissions
  async createSubmission(schemaId: string, formKey: string, data: any) {
    return fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ schemaId, formKey, data })
    }).then(r => r.json());
  },

  // Drafts
  async saveDraft(schemaId: string, formKey: string, data: any) {
    return fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ schemaId, formKey, data })
    }).then(r => r.json());
  },

  // Validations
  async validateForm(schemaId: string, data: any) {
    return fetch('/api/validations/validate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ schemaId, data })
    }).then(r => r.json());
  }
};
```

## Docker

### Build
```bash
docker build -t submission-service .
```

### Run
```bash
docker run -p 3006:3006 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/submission-service \
  submission-service
```

## Testing

```bash
npm test
```

## Next Steps

1. Add authentication middleware to validate JWT tokens
2. Add authorization checks based on user roles
3. Add audit logging for all operations
4. Add file upload support for file/image fields
5. Add WebSocket support for real-time collaboration
6. Add email notifications on submission status changes
7. Add reporting and analytics endpoints
8. Add batch import/export functionality
