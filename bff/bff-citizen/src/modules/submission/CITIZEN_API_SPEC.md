# BFF Citizen - Submission API Specification

## Overview

The Citizen Submission API allows citizens to submit forms, manage drafts, and retrieve form schemas. This API is designed for the Gov.PH citizen portal and requires authentication.

## Authentication

All endpoints require:
1. Valid JWT token in `Authorization` header format: `Bearer <token>`
2. Valid citizen user context
3. Internal service authentication via SUBMISSION_SERVICE_URL

## Base URL

```
http://citizen.localhost
```

Docker environment:
```
http://govph-bff-citizen:3001/api/citizen
```

---

## API Endpoints

### 1. Form Schemas

#### Get Schema by ID
Retrieve a specific form schema for displaying to citizens.

```
GET /api/citizen/forms/schemas/:schemaId
```

**Parameters:**
- `schemaId` (path, required): The ID of the form schema

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "schema-123",
    "title": "Evacuation Registration Form",
    "description": "Form for evacuation center registration",
    "formKey": "evacuation-form",
    "status": "PUBLISHED",
    "fields": [
      {
        "id": "name",
        "type": "text",
        "label": "Full Name",
        "required": true,
        "placeholder": "Enter your full name",
        "default": "",
        "validation": {
          "minLength": 2,
          "maxLength": 100
        },
        "ui": {
          "placeholder": "Enter your full name",
          "className": "form-control"
        },
        "visibility": {
          "condition": null,
          "dependsOn": null
        },
        "meta": {
          "tags": ["personal-info"],
          "order": 1
        }
      },
      {
        "id": "email",
        "type": "email",
        "label": "Email Address",
        "required": true,
        "placeholder": "john@example.com",
        "default": "",
        "validation": {
          "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
        },
        "ui": {
          "placeholder": "john@example.com",
          "className": "form-control"
        },
        "visibility": {
          "condition": null,
          "dependsOn": null
        },
        "meta": {
          "tags": ["contact-info"],
          "order": 2
        }
      },
      {
        "id": "phone",
        "type": "tel",
        "label": "Phone Number",
        "required": true,
        "placeholder": "+63-912-345-6789",
        "default": "",
        "validation": {
          "pattern": "^\\+63-?\\d{10}$"
        },
        "ui": {
          "placeholder": "+63-912-345-6789",
          "className": "form-control"
        },
        "visibility": {
          "condition": null,
          "dependsOn": null
        },
        "meta": {
          "tags": ["contact-info"],
          "order": 3
        }
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "publishedAt": "2024-01-16T08:00:00Z"
  },
  "code": "SCHEMA_FETCHED",
  "message": "Form schema fetched successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "code": "SCHEMA_NOT_FOUND",
  "message": "Form schema not found",
  "timestamp": "2024-01-17T10:15:00Z"
}
```

---

### 2. Submissions

#### Get All Submissions
Retrieve all submissions submitted by the authenticated citizen.

```
GET /api/citizen/forms/submissions
```

**Query Parameters:**
- `schemaId` (optional): Filter by schema ID
- `status` (optional): Filter by status - `SUBMITTED`, `REVIEWED`, `APPROVED`, `REJECTED`
- `limit` (optional, default: 10): Number of results per page
- `page` (optional, default: 1): Page number for pagination

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "data": {
    "items": [
      {
        "id": "sub-123",
        "schemaId": "schema-123",
        "userId": "user-456",
        "formKey": "evacuation-form",
        "status": "SUBMITTED",
        "data": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+63-912-345-6789"
        },
        "notes": null,
        "submittedAt": "2024-01-17T10:15:00Z",
        "reviewedAt": null,
        "createdAt": "2024-01-17T10:15:00Z",
        "updatedAt": "2024-01-17T10:15:00Z"
      },
      {
        "id": "sub-124",
        "schemaId": "schema-123",
        "userId": "user-456",
        "formKey": "evacuation-form",
        "status": "APPROVED",
        "data": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+63-912-345-6789"
        },
        "notes": "Approved for evacuation center assignment",
        "submittedAt": "2024-01-16T14:30:00Z",
        "reviewedAt": "2024-01-17T09:00:00Z",
        "createdAt": "2024-01-16T14:30:00Z",
        "updatedAt": "2024-01-17T09:00:00Z"
      }
    ],
    "meta": {
      "totalCount": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  },
  "code": "SUBMISSIONS_FETCHED",
  "message": "Submissions fetched successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "code": "UNAUTHORIZED",
  "message": "Invalid or missing authentication token",
  "timestamp": "2024-01-17T10:15:00Z"
}
```

---

#### Get Submission by ID
Retrieve a specific submission submitted by the citizen.

```
GET /api/citizen/forms/submissions/:submissionId
```

**Parameters:**
- `submissionId` (path, required): The ID of the submission

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "sub-123",
    "schemaId": "schema-123",
    "userId": "user-456",
    "formKey": "evacuation-form",
    "status": "SUBMITTED",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+63-912-345-6789"
    },
    "notes": null,
    "submittedAt": "2024-01-17T10:15:00Z",
    "reviewedAt": null,
    "createdAt": "2024-01-17T10:15:00Z",
    "updatedAt": "2024-01-17T10:15:00Z"
  },
  "code": "SUBMISSION_FETCHED",
  "message": "Submission fetched successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "code": "SUBMISSION_NOT_FOUND",
  "message": "Submission not found",
  "timestamp": "2024-01-17T10:15:00Z"
}
```

---

### 3. Drafts

#### Get All Drafts
Retrieve all saved drafts for the authenticated citizen.

```
GET /api/citizen/forms/drafts
```

**Query Parameters:**
- `schemaId` (optional): Filter by schema ID
- `limit` (optional, default: 10): Number of results per page
- `page` (optional, default: 1): Page number for pagination

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "data": {
    "items": [
      {
        "id": "draft-101",
        "schemaId": "schema-123",
        "userId": "user-456",
        "formKey": "evacuation-form",
        "data": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "completion": 50,
        "expiresAt": "2024-02-16T14:30:00Z",
        "createdAt": "2024-01-17T14:30:00Z",
        "updatedAt": "2024-01-17T15:45:00Z"
      },
      {
        "id": "draft-102",
        "schemaId": "schema-456",
        "userId": "user-456",
        "formKey": "relief-assistance-form",
        "data": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+63-912-345-6789"
        },
        "completion": 75,
        "expiresAt": "2024-02-17T10:00:00Z",
        "createdAt": "2024-01-17T10:00:00Z",
        "updatedAt": "2024-01-17T16:20:00Z"
      }
    ],
    "meta": {
      "totalCount": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  },
  "code": "DRAFTS_FETCHED",
  "message": "Drafts fetched successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "code": "UNAUTHORIZED",
  "message": "Invalid or missing authentication token",
  "timestamp": "2024-01-17T10:15:00Z"
}
```

---

#### Get Draft by ID
Retrieve a specific draft to continue filling out.

```
GET /api/citizen/forms/drafts/:draftId
```

**Parameters:**
- `draftId` (path, required): The ID of the draft

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "draft-101",
    "schemaId": "schema-123",
    "userId": "user-456",
    "formKey": "evacuation-form",
    "data": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "completion": 50,
    "expiresAt": "2024-02-16T14:30:00Z",
    "createdAt": "2024-01-17T14:30:00Z",
    "updatedAt": "2024-01-17T15:45:00Z"
  },
  "code": "DRAFT_FETCHED",
  "message": "Draft fetched successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "code": "DRAFT_NOT_FOUND",
  "message": "Draft not found",
  "timestamp": "2024-01-17T10:15:00Z"
}
```

**Error Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "code": "FORBIDDEN",
  "message": "You do not have permission to access this draft",
  "timestamp": "2024-01-17T10:15:00Z"
}
```

---

#### Delete Draft
Delete a saved draft.

```
DELETE /api/citizen/forms/drafts/:draftId
```

**Parameters:**
- `draftId` (path, required): The ID of the draft to delete

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "code": "DRAFT_DELETED",
  "message": "Draft deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "code": "DRAFT_NOT_FOUND",
  "message": "Draft not found",
  "timestamp": "2024-01-17T10:15:00Z"
}
```

**Error Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "code": "FORBIDDEN",
  "message": "You do not have permission to delete this draft",
  "timestamp": "2024-01-17T10:15:00Z"
}
```

---

### 4. Form Validation

#### Validate Form Data
Validate form data against a schema before submission.

```
POST /api/citizen/forms/validate
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "schemaId": "schema-123",
  "formKey": "evacuation-form",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+63-912-345-6789"
  }
}
```

**Success Response (200 OK) - Valid:**
```json
{
  "isValid": true,
  "errors": [],
  "code": "VALIDATION_PASSED",
  "message": "Form data is valid"
}
```

**Error Response (400 Bad Request) - Invalid:**
```json
{
  "isValid": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "phone",
      "message": "Phone number must be in valid format"
    }
  ],
  "code": "VALIDATION_FAILED",
  "message": "Form data validation failed"
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "code": "SCHEMA_NOT_FOUND",
  "message": "Form schema not found",
  "timestamp": "2024-01-17T10:15:00Z"
}
```

---

## Response Structure

All API responses follow a standard format:

### Success Response
```typescript
interface SuccessResponse<T> {
  data?: T;
  code: string;
  message: string;
  timestamp?: string;
}
```

### Error Response
```typescript
interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
}
```

### Paginated Response
```typescript
interface PaginatedResponse<T> {
  data: {
    items: T[];
    meta: {
      totalCount: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  code: string;
  message: string;
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - User doesn't have permission to access resource |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Common Error Codes

| Code | Description |
|------|-------------|
| `SCHEMA_NOT_FOUND` | Form schema does not exist |
| `SUBMISSION_NOT_FOUND` | Submission does not exist |
| `DRAFT_NOT_FOUND` | Draft does not exist |
| `VALIDATION_FAILED` | Form data failed validation |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | User lacks required permissions |
| `INTERNAL_SERVER_ERROR` | Server encountered an error |

---

## Data Types

### FormField
```typescript
interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'time' | 
        'datetime' | 'select' | 'radio' | 'checkbox' | 'file' | 
        'image' | 'section' | 'divider' | 'info';
  label: string;
  required: boolean;
  placeholder?: string;
  default?: any;
  options?: Array<{ value: string | number; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    maxSizeMB?: number;
    allowedTypes?: string[];
  };
  ui?: {
    width?: string;
    hint?: string;
    placeholder?: string;
  };
  visibility?: {
    when?: Array<{
      field: string;
      operator: string;
      value?: any;
    }>;
  };
  meta?: {
    tags?: string[];
    [key: string]: any;
  };
}
```

### FormSchema
```typescript
interface FormSchemaData {
  id: string;
  title: string;
  description: string;
  formKey: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

### Submission
```typescript
interface SubmissionData {
  id: string;
  schemaId: string;
  userId: string;
  formKey: string;
  status: 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  data: Record<string, any>;
  notes?: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Draft
```typescript
interface DraftData {
  id: string;
  schemaId: string;
  userId: string;
  formKey: string;
  data: Record<string, any>;
  completion: number; // 0-100
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Usage Examples

### Get a Form Schema
```javascript
const response = await fetch(
  '/api/citizen/forms/schemas/schema-123',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
const schema = await response.json();
```

### Retrieve All Submissions
```javascript
const response = await fetch(
  '/api/citizen/forms/submissions?status=APPROVED&limit=20',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
const submissions = await response.json();
```

### Get Draft and Continue
```javascript
const response = await fetch(
  '/api/citizen/forms/drafts/draft-101',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
const draft = await response.json();
console.log(`Completion: ${draft.data.completion}%`);
console.log(`Saved data:`, draft.data.data);
```

### Validate Form Before Submission
```javascript
const validationResponse = await fetch(
  '/api/citizen/forms/validate',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      schemaId: 'schema-123',
      formKey: 'evacuation-form',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+63-912-345-6789'
      }
    })
  }
);
const validation = await validationResponse.json();

if (validation.isValid) {
  console.log('Form is valid, ready to submit');
} else {
  console.log('Validation errors:', validation.errors);
}
```

### Delete a Draft
```javascript
const response = await fetch(
  '/api/citizen/forms/drafts/draft-101',
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
const result = await response.json();
console.log(result.message); // "Draft deleted successfully"
```

---

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT token
2. **User Isolation**: Citizens can only access their own submissions and drafts
3. **Published Schemas Only**: Only published schemas are accessible to citizens
4. **Token Validation**: JWT tokens are validated against Identity Service
5. **HTTPS Required**: All API calls should use HTTPS in production

---

## Rate Limiting

Current rate limits (may be subject to change):
- 100 requests per minute per user
- 1000 requests per hour per user

---

## Pagination

All list endpoints support pagination:
- Default page size: 10
- Maximum page size: 100
- Pages are 1-indexed

Query example:
```
GET /api/citizen/forms/submissions?page=2&limit=20
```

---

## Environment Variables

Configure these in `.env`:

```env
SUBMISSION_SERVICE_URL=http://govph-submission:3000
NODE_ENV=development
LOG_LEVEL=info
```

---

## Troubleshooting

### 401 Unauthorized
- Verify JWT token is valid and not expired
- Check Authorization header format: `Bearer <token>`
- Token may need to be refreshed

### 403 Forbidden
- Verify user is authenticated
- Check that user context is properly set
- Verify resource ownership (can only access own submissions/drafts)

### 404 Not Found
- Verify the resource ID is correct
- Check if resource has been deleted
- Verify schema is published (for schema access)

### Validation Errors
- Check field types match schema definition
- Verify required fields are provided
- Review validation rules in schema

---

## Support

For issues or questions:
- Check submission service logs: `docker logs govph-submission`
- Check bff-citizen logs: `docker logs govph-bff-citizen`
- Review submission service API spec: `services/submission-service/API_SPEC.md`

