# Submission Service - API Specification

## Overview

The Submission Service (`submission-service`) provides RESTful APIs for managing form schemas, submissions, drafts, and real-time form validation. The service is built with Express.js, MongoDB, and Joi validation.

**Service URL**: `http://submission-service:3006` (internal)  
**Gateway URL**: Accessible via Kong gateway (configured in docker-compose)  
**Authentication**: JWT Bearer token (via `Authorization` header)

---

## Response Format

All API responses follow a standardized format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* field-level error details */ }
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "meta": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful request |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Business logic violation |
| 500 | Internal Server Error |
| 502 | Bad Gateway - External service error |

---

## SCHEMAS MODULE

### List Form Schemas

**Endpoint**: `GET /api/schemas`

**Query Parameters**:
```
skip (optional, default: 0) - Number of records to skip
limit (optional, default: 20) - Number of records to return
status (optional) - Filter by status: DRAFT, PUBLISHED, ARCHIVED
formKey (optional) - Filter by form key
```

**Example Request**:
```bash
curl -X GET "http://localhost:3006/api/schemas?userId=''&status=PUBLISHED&skip=0&limit=20" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "formKey": "employment_form",
        "version": 1,
        "status": "PUBLISHED",
        "title": "Employment Information Form",
        "description": "Please provide your employment details",
        "fields": [
          {
            "id": "field_001",
            "type": "text",
            "label": "Full Name",
            "required": true,
            "placeholder": "Enter your full name",
            "validation": {
              "minLength": 2,
              "maxLength": 100
            }
          },
          {
            "id": "field_002",
            "type": "email",
            "label": "Email Address",
            "required": true,
            "validation": {
              "pattern": "email"
            }
          }
        ],
        "createdAt": "2026-01-10T08:00:00.000Z",
        "createdBy": "user_123",
        "updatedAt": "2026-01-15T14:30:00.000Z",
        "updatedBy": "user_456",
        "publishedAt": "2026-01-15T14:30:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 20,
      "total": 45,
      "totalPages": 3
    }
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Get Form Schema

**Endpoint**: `GET /api/schemas/:id`

**Path Parameters**:
- `id` (required) - MongoDB ObjectId of the schema

**Example Request**:
```bash
curl -X GET "http://localhost:3006/api/schemas/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "version": 1,
    "status": "PUBLISHED",
    "title": "Employment Information Form",
    "description": "Please provide your employment details",
    "fields": [
      {
        "id": "field_001",
        "type": "text",
        "label": "Full Name",
        "required": true,
        "placeholder": "Enter your full name",
        "default": null,
        "options": null,
        "validation": {
          "minLength": 2,
          "maxLength": 100
        },
        "ui": {
          "rows": 1,
          "className": "form-control"
        },
        "visibility": {
          "condition": null
        }
      },
      {
        "id": "field_002",
        "type": "email",
        "label": "Email Address",
        "required": true,
        "placeholder": "example@email.com",
        "validation": {
          "pattern": "email"
        }
      },
      {
        "id": "field_003",
        "type": "number",
        "label": "Years of Experience",
        "required": false,
        "validation": {
          "minimum": 0,
          "maximum": 70
        }
      },
      {
        "id": "field_004",
        "type": "select",
        "label": "Department",
        "required": true,
        "options": [
          { "value": "hr", "label": "Human Resources" },
          { "value": "it", "label": "Information Technology" },
          { "value": "finance", "label": "Finance" }
        ]
      }
    ],
    "createdAt": "2026-01-10T08:00:00.000Z",
    "createdBy": "user_123",
    "updatedAt": "2026-01-15T14:30:00.000Z",
    "updatedBy": "user_456",
    "publishedAt": "2026-01-15T14:30:00.000Z"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "error": {
    "code": "SCHEMA_NOT_FOUND",
    "message": "Form schema not found"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Create Form Schema

**Endpoint**: `POST /api/schemas`

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "formKey": "employment_form",
  "title": "Employment Information Form",
  "description": "Please provide your employment details",
  "fields": [
    {
      "id": "field_001",
      "type": "text",
      "label": "Full Name",
      "required": true,
      "placeholder": "Enter your full name",
      "validation": {
        "minLength": 2,
        "maxLength": 100
      },
      "ui": {
        "rows": 1
      }
    },
    {
      "id": "field_002",
      "type": "email",
      "label": "Email Address",
      "required": true,
      "validation": {
        "pattern": "email"
      }
    },
    {
      "id": "field_003",
      "type": "select",
      "label": "Department",
      "required": true,
      "options": [
        { "value": "hr", "label": "Human Resources" },
        { "value": "it", "label": "Information Technology" }
      ]
    },
    {
      "id": "field_004",
      "type": "checkbox",
      "label": "Agree to Terms",
      "required": true,
      "options": [
        { "value": "agree", "label": "I agree to the terms and conditions" }
      ]
    }
  ]
}
```

**Supported Field Types**:
- `text` - Single line text input
- `email` - Email input with validation
- `tel` - Phone number input
- `number` - Numeric input
- `date` - Date picker
- `time` - Time picker
- `datetime` - Date and time picker
- `select` - Dropdown selection
- `radio` - Single choice radio buttons
- `checkbox` - Multiple choice checkboxes
- `file` - File upload
- `image` - Image upload
- `section` - Form section header
- `divider` - Visual divider
- `info` - Information display

**Example Request**:
```bash
curl -X POST "http://localhost:3006/api/schemas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "formKey": "employment_form",
    "title": "Employment Information Form",
    "description": "Please provide your employment details",
    "fields": [
      {
        "id": "field_001",
        "type": "text",
        "label": "Full Name",
        "required": true
      }
    ]
  }'
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "formKey": "employment_form",
    "version": 1,
    "status": "DRAFT",
    "title": "Employment Information Form",
    "description": "Please provide your employment details",
    "fields": [
      {
        "id": "field_001",
        "type": "text",
        "label": "Full Name",
        "required": true,
        "placeholder": null,
        "validation": {}
      }
    ],
    "createdAt": "2026-01-17T10:30:00.000Z",
    "createdBy": "user_123",
    "updatedAt": "2026-01-17T10:30:00.000Z"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "formKey": "formKey is required",
      "title": "title is required",
      "fields": "fields must be an array"
    }
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Update Form Schema

**Endpoint**: `PUT /api/schemas/:id`

**Path Parameters**:
- `id` (required) - MongoDB ObjectId of the schema

**Request Body** (all fields optional):
```json
{
  "title": "Updated Employment Form",
  "description": "Updated description",
  "fields": [
    {
      "id": "field_001",
      "type": "text",
      "label": "Full Name",
      "required": true
    }
  ]
}
```

**Example Request**:
```bash
curl -X PUT "http://localhost:3006/api/schemas/507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "title": "Updated Employment Information Form"
  }'
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "version": 1,
    "status": "DRAFT",
    "title": "Updated Employment Information Form",
    "description": "Please provide your employment details",
    "fields": [ /* ... */ ],
    "createdAt": "2026-01-10T08:00:00.000Z",
    "createdBy": "user_123",
    "updatedAt": "2026-01-17T10:30:00.000Z",
    "updatedBy": "user_456"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

**Error Response (409)** - Schema already published:
```json
{
  "success": false,
  "error": {
    "code": "SCHEMA_ALREADY_PUBLISHED",
    "message": "Cannot update a published schema"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Delete Form Schema

**Endpoint**: `DELETE /api/schemas/:id`

**Path Parameters**:
- `id` (required) - MongoDB ObjectId of the schema

**Example Request**:
```bash
curl -X DELETE "http://localhost:3006/api/schemas/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Publish Form Schema

**Endpoint**: `POST /api/schemas/:id/publish`

**Path Parameters**:
- `id` (required) - MongoDB ObjectId of the schema

**Request Body**: (empty)

**Example Request**:
```bash
curl -X POST "http://localhost:3006/api/schemas/507f1f77bcf86cd799439011/publish" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "version": 1,
    "status": "PUBLISHED",
    "title": "Employment Information Form",
    "description": "Please provide your employment details",
    "fields": [ /* ... */ ],
    "createdAt": "2026-01-10T08:00:00.000Z",
    "createdBy": "user_123",
    "updatedAt": "2026-01-15T14:30:00.000Z",
    "updatedBy": "user_456",
    "publishedAt": "2026-01-15T14:30:00.000Z"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

## SUBMISSIONS MODULE

### List Submissions

**Endpoint**: `GET /api/submissions`

**Query Parameters**:
```
skip (optional, default: 0) - Number of records to skip
limit (optional, default: 20) - Number of records to return
schemaId (optional) - Filter by schema ID
status (optional) - Filter by status: SUBMITTED, REVIEWED, APPROVED, REJECTED
formKey (optional) - Filter by form key
```

**Example Request**:
```bash
curl -X GET "http://localhost:3006/api/submissions?schemaId=507f1f77bcf86cd799439011&status=SUBMITTED&skip=0&limit=20" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "607f1f77bcf86cd799439050",
        "schemaId": "507f1f77bcf86cd799439011",
        "formKey": "employment_form",
        "data": {
          "field_001": "John Doe",
          "field_002": "john@example.com",
          "field_003": 5,
          "field_004": "hr"
        },
        "status": "SUBMITTED",
        "createdAt": "2026-01-16T09:15:00.000Z",
        "createdBy": "citizen_123",
        "updatedAt": "2026-01-16T09:15:00.000Z",
        "reviewedAt": null,
        "reviewedBy": null,
        "notes": null
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 20,
      "total": 127,
      "totalPages": 7
    }
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Get Submission

**Endpoint**: `GET /api/submissions/:id`

**Path Parameters**:
- `id` (required) - MongoDB ObjectId of the submission

**Example Request**:
```bash
curl -X GET "http://localhost:3006/api/submissions/607f1f77bcf86cd799439050" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "607f1f77bcf86cd799439050",
    "schemaId": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "data": {
      "field_001": "John Doe",
      "field_002": "john@example.com",
      "field_003": 5,
      "field_004": "hr"
    },
    "status": "SUBMITTED",
    "createdAt": "2026-01-16T09:15:00.000Z",
    "createdBy": "citizen_123",
    "updatedAt": "2026-01-16T09:15:00.000Z",
    "updatedBy": null,
    "reviewedAt": null,
    "reviewedBy": null,
    "notes": null
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Create Submission

**Endpoint**: `POST /api/submissions`

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "schemaId": "507f1f77bcf86cd799439011",
  "formKey": "employment_form",
  "data": {
    "field_001": "John Doe",
    "field_002": "john@example.com",
    "field_003": 5,
    "field_004": "hr"
  }
}
```

**Example Request**:
```bash
curl -X POST "http://localhost:3006/api/submissions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "schemaId": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "data": {
      "field_001": "John Doe",
      "field_002": "john@example.com",
      "field_003": 5,
      "field_004": "hr"
    }
  }'
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "_id": "607f1f77bcf86cd799439051",
    "schemaId": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "data": {
      "field_001": "John Doe",
      "field_002": "john@example.com",
      "field_003": 5,
      "field_004": "hr"
    },
    "status": "SUBMITTED",
    "createdAt": "2026-01-17T10:30:00.000Z",
    "createdBy": "citizen_123",
    "updatedAt": "2026-01-17T10:30:00.000Z",
    "reviewedAt": null,
    "reviewedBy": null,
    "notes": null
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Update Submission

**Endpoint**: `PUT /api/submissions/:id`

**Path Parameters**:
- `id` (required) - MongoDB ObjectId of the submission

**Request Body** (all fields optional):
```json
{
  "status": "APPROVED",
  "notes": "Approved after review",
  "data": {
    "field_001": "John Doe",
    "field_002": "john@example.com"
  }
}
```

**Allowed Status Transitions**:
- `SUBMITTED` → `REVIEWED`, `APPROVED`, `REJECTED`
- `REVIEWED` → `APPROVED`, `REJECTED`
- `APPROVED`, `REJECTED` → (final states)

**Example Request**:
```bash
curl -X PUT "http://localhost:3006/api/submissions/607f1f77bcf86cd799439050" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "status": "APPROVED",
    "notes": "Approved after verification"
  }'
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "607f1f77bcf86cd799439050",
    "schemaId": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "data": {
      "field_001": "John Doe",
      "field_002": "john@example.com",
      "field_003": 5,
      "field_004": "hr"
    },
    "status": "APPROVED",
    "createdAt": "2026-01-16T09:15:00.000Z",
    "createdBy": "citizen_123",
    "updatedAt": "2026-01-17T10:30:00.000Z",
    "updatedBy": "admin_456",
    "reviewedAt": "2026-01-17T10:30:00.000Z",
    "reviewedBy": "admin_456",
    "notes": "Approved after verification"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Delete Submission

**Endpoint**: `DELETE /api/submissions/:id`

**Path Parameters**:
- `id` (required) - MongoDB ObjectId of the submission

**Example Request**:
```bash
curl -X DELETE "http://localhost:3006/api/submissions/607f1f77bcf86cd799439050" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "607f1f77bcf86cd799439050"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

## DRAFTS MODULE

### List Drafts

**Endpoint**: `GET /api/drafts`

**Query Parameters**:
```
skip (optional, default: 0) - Number of records to skip
limit (optional, default: 20) - Number of records to return
schemaId (optional) - Filter by schema ID
formKey (optional) - Filter by form key
```

**Example Request**:
```bash
curl -X GET "http://localhost:3006/api/drafts?schemaId=507f1f77bcf86cd799439011&skip=0&limit=20" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "707f1f77bcf86cd799439100",
        "schemaId": "507f1f77bcf86cd799439011",
        "formKey": "employment_form",
        "data": {
          "field_001": "Jane Smith",
          "field_002": "jane@example.com"
        },
        "createdAt": "2026-01-17T08:45:00.000Z",
        "createdBy": "citizen_456",
        "updatedAt": "2026-01-17T09:30:00.000Z",
        "updatedBy": "citizen_456",
        "expiresAt": "2026-02-16T08:45:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 20,
      "total": 42,
      "totalPages": 3
    }
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Get Draft

**Endpoint**: `GET /api/drafts/:id`

**Path Parameters**:
- `id` (required) - MongoDB ObjectId of the draft

**Example Request**:
```bash
curl -X GET "http://localhost:3006/api/drafts/707f1f77bcf86cd799439100" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "707f1f77bcf86cd799439100",
    "schemaId": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "data": {
      "field_001": "Jane Smith",
      "field_002": "jane@example.com"
    },
    "createdAt": "2026-01-17T08:45:00.000Z",
    "createdBy": "citizen_456",
    "updatedAt": "2026-01-17T09:30:00.000Z",
    "updatedBy": "citizen_456",
    "expiresAt": "2026-02-16T08:45:00.000Z"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Save Draft

**Endpoint**: `POST /api/drafts`

**Smart Save Behavior**:
- If no draft exists for the user+schema combination, creates a new draft
- If draft exists, updates the existing draft with new data
- Draft automatically expires after 30 days (TTL index)

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "schemaId": "507f1f77bcf86cd799439011",
  "formKey": "employment_form",
  "data": {
    "field_001": "Jane Smith",
    "field_002": "jane@example.com"
  }
}
```

**Example Request**:
```bash
curl -X POST "http://localhost:3006/api/drafts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "schemaId": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "data": {
      "field_001": "Jane Smith",
      "field_002": "jane@example.com"
    }
  }'
```

**Response (201/200)**:
```json
{
  "success": true,
  "data": {
    "_id": "707f1f77bcf86cd799439101",
    "schemaId": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "data": {
      "field_001": "Jane Smith",
      "field_002": "jane@example.com"
    },
    "createdAt": "2026-01-17T10:30:00.000Z",
    "createdBy": "citizen_456",
    "updatedAt": "2026-01-17T10:30:00.000Z",
    "updatedBy": "citizen_456",
    "expiresAt": "2026-02-16T10:30:00.000Z"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Update Draft

**Endpoint**: `PUT /api/drafts/:id`

**Path Parameters**:
- `id` (required) - MongoDB ObjectId of the draft

**Request Body**:
```json
{
  "data": {
    "field_001": "Jane Smith",
    "field_002": "jane@example.com",
    "field_003": 3
  }
}
```

**Example Request**:
```bash
curl -X PUT "http://localhost:3006/api/drafts/707f1f77bcf86cd799439100" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "data": {
      "field_001": "Jane Smith",
      "field_002": "jane@example.com",
      "field_003": 3
    }
  }'
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "707f1f77bcf86cd799439100",
    "schemaId": "507f1f77bcf86cd799439011",
    "formKey": "employment_form",
    "data": {
      "field_001": "Jane Smith",
      "field_002": "jane@example.com",
      "field_003": 3
    },
    "createdAt": "2026-01-17T08:45:00.000Z",
    "createdBy": "citizen_456",
    "updatedAt": "2026-01-17T10:30:00.000Z",
    "updatedBy": "citizen_456",
    "expiresAt": "2026-02-16T08:45:00.000Z"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

### Delete Draft

**Endpoint**: `DELETE /api/drafts/:id`

**Path Parameters**:
- `id` (required) - MongoDB ObjectId of the draft

**Example Request**:
```bash
curl -X DELETE "http://localhost:3006/api/drafts/707f1f77bcf86cd799439100" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "707f1f77bcf86cd799439100"
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

## VALIDATIONS MODULE

### Validate Form Data

**Endpoint**: `POST /api/validations/validate`

**Purpose**: Real-time validation of form data against schema field definitions before submission

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "schemaId": "507f1f77bcf86cd799439011",
  "data": {
    "field_001": "John Doe",
    "field_002": "john@example.com",
    "field_003": 5,
    "field_004": "hr"
  }
}
```

**Validation Rules** (applied based on field type and configuration):

| Field Type | Rules | Example |
|-----------|-------|---------|
| `text` | minLength, maxLength, pattern | `"John Doe"` |
| `email` | email format, required | `"john@example.com"` |
| `tel` | phone format, length | `"+63912345678"` |
| `number` | minimum, maximum, integer | `5` |
| `date` | valid date, min/max date | `"2026-01-17"` |
| `time` | valid time format | `"10:30:00"` |
| `datetime` | valid ISO datetime | `"2026-01-17T10:30:00Z"` |
| `select` | value in options | `"hr"` |
| `radio` | value in options | `"option1"` |
| `checkbox` | values in options | `["opt1", "opt2"]` |
| `file` | file type, size | (file upload) |
| `image` | image type, dimensions | (image upload) |

**Example Request**:
```bash
curl -X POST "http://localhost:3006/api/validations/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "schemaId": "507f1f77bcf86cd799439011",
    "data": {
      "field_001": "John Doe",
      "field_002": "john@example.com",
      "field_003": 5,
      "field_004": "hr"
    }
  }'
```

**Response - Valid Data (200)**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "data": {
      "field_001": "John Doe",
      "field_002": "john@example.com",
      "field_003": 5,
      "field_004": "hr"
    },
    "errors": {}
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

**Response - Invalid Data (200)**:
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "data": {
      "field_001": "Jo",
      "field_002": "invalid-email",
      "field_003": 75,
      "field_004": "invalid_dept"
    },
    "errors": {
      "field_001": "must be at least 2 characters",
      "field_002": "must be a valid email",
      "field_003": "must not exceed 70",
      "field_004": "must be one of: hr, it, finance"
    }
  },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

---

## ERROR CODES

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `SCHEMA_NOT_FOUND` | 404 | Form schema does not exist |
| `SUBMISSION_NOT_FOUND` | 404 | Submission does not exist |
| `DRAFT_NOT_FOUND` | 404 | Draft does not exist |
| `SCHEMA_ALREADY_PUBLISHED` | 409 | Cannot update a published schema |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `EXTERNAL_SERVICE_ERROR` | 502 | External service error |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Insufficient permissions |

---

## AUTHENTICATION

All endpoints (except health check) require JWT Bearer token authentication.

**Header Format**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Token Format** (JWT):
```
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "citizen|admin|dept_head",
  "municipality": "city_code",
  "department": "dept_code",
  "iat": 1674000000,
  "exp": 1674086400
}
```

**Example**:
```bash
curl -X GET "http://localhost:3006/api/schemas" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## PAGINATION

List endpoints support pagination through query parameters:

**Parameters**:
```
skip (default: 0) - Number of records to skip
limit (default: 20) - Number of records per page
```

**Meta Response**:
```json
"meta": {
  "page": 1,
  "pageSize": 20,
  "total": 150,
  "totalPages": 8
}
```

**Page Calculation**:
```
page = (skip / limit) + 1
totalPages = ceil(total / limit)
```

---

## USAGE EXAMPLES

### Example 1: Create and Publish a Form

```bash
# Step 1: Create form schema
curl -X POST "http://localhost:3006/api/schemas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "formKey": "permit_application",
    "title": "Business Permit Application",
    "fields": [
      {
        "id": "business_name",
        "type": "text",
        "label": "Business Name",
        "required": true
      },
      {
        "id": "business_type",
        "type": "select",
        "label": "Business Type",
        "required": true,
        "options": [
          {"value": "retail", "label": "Retail"},
          {"value": "service", "label": "Service"}
        ]
      }
    ]
  }'

# Response contains schema ID: 507f1f77bcf86cd799439011

# Step 2: Publish the schema
curl -X POST "http://localhost:3006/api/schemas/507f1f77bcf86cd799439011/publish" \
  -H "Authorization: Bearer <TOKEN>"
```

### Example 2: Submit a Form with Draft Auto-Save

```bash
# Step 1: Auto-save draft (can be called multiple times)
curl -X POST "http://localhost:3006/api/drafts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "schemaId": "507f1f77bcf86cd799439011",
    "formKey": "permit_application",
    "data": {
      "business_name": "ABC Store"
    }
  }'

# Step 2: Validate before submission
curl -X POST "http://localhost:3006/api/validations/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "schemaId": "507f1f77bcf86cd799439011",
    "data": {
      "business_name": "ABC Store",
      "business_type": "retail"
    }
  }'

# Step 3: Submit the form (if valid)
curl -X POST "http://localhost:3006/api/submissions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "schemaId": "507f1f77bcf86cd799439011",
    "formKey": "permit_application",
    "data": {
      "business_name": "ABC Store",
      "business_type": "retail"
    }
  }'

# Step 4: Delete draft after successful submission
curl -X DELETE "http://localhost:3006/api/drafts/{draftId}" \
  -H "Authorization: Bearer <TOKEN>"
```

### Example 3: Review and Approve Submission

```bash
# Step 1: Get all pending submissions
curl -X GET "http://localhost:3006/api/submissions?status=SUBMITTED" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Step 2: Review specific submission
curl -X GET "http://localhost:3006/api/submissions/607f1f77bcf86cd799439050" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Step 3: Approve submission
curl -X PUT "http://localhost:3006/api/submissions/607f1f77bcf86cd799439050" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "status": "APPROVED",
    "notes": "All requirements met. Approved for processing."
  }'
```

---

## RATE LIMITING

Currently not enforced. To be implemented based on identity-service patterns.

---

## VERSIONING

API Version: **v1**  
Future versions: `/api/v2/`, `/api/v3/`, etc.

---

## SUPPORT

For issues or questions regarding the API:
1. Check service logs: `docker logs submission-service`
2. Review error codes in responses
3. Verify MongoDB connection in `.env`
4. Check JWT token validity and expiration
