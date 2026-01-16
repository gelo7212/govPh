# BFF Admin - Submission Service Integration

## Overview

The submission service integration in bff-admin enables form schema management, submission review workflows, and draft administration for the Gov.PH platform.

## API Endpoints

### Form Schema Management

#### Get All Schemas
```
GET /api/admin/forms/schemas
Query Parameters:
  - status: SchemaStatus (DRAFT, PUBLISHED, ARCHIVED)
  - limit: number (default: 10)
  - page: number (default: 1)

Response: PaginatedResponse<FormSchemaData>
{
  "data": {
    "items": [
      {
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
            "validation": {
              "minLength": 2,
              "maxLength": 100,
              "pattern": "^[a-zA-Z ]+$"
            }
          },
          {
            "id": "email",
            "type": "email",
            "label": "Email Address",
            "required": true,
            "validation": {
              "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
            }
          },
          {
            "id": "province",
            "type": "select",
            "label": "Province",
            "required": true,
            "options": [
              { "label": "Metro Manila", "value": "metro-manila" },
              { "label": "Calabarzon", "value": "calabarzon" },
              { "label": "Central Luzon", "value": "central-luzon" }
            ]
          }
        ],
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "meta": {
      "totalCount": 5,
      "page": 1,
      "limit": 10
    }
  }
}
```

#### Get Schema by ID
```
GET /api/admin/forms/schemas/:schemaId

Response: FormSchemaResponse<FormSchemaData>
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

#### Create New Schema
```
POST /api/admin/forms/schemas

Body: CreateFormSchemaRequest
{
  "title": "Emergency Evacuation Form",
  "description": "Form for evacuation center assignments",
  "formKey": "evacuation-form",
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
  ]
}

Response: FormSchemaResponse<FormSchemaData> (201 Created)
{
  "data": {
    "id": "schema-new-123",
    "title": "Emergency Evacuation Form",
    "description": "Form for evacuation center assignments",
    "formKey": "evacuation-form",
    "status": "DRAFT",
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
    "createdAt": "2024-01-17T14:25:00Z",
    "updatedAt": "2024-01-17T14:25:00Z"
  },
  "code": "SCHEMA_CREATED",
  "message": "Form schema created successfully"
}
```

#### Update Schema
```
PUT /api/admin/forms/schemas/:schemaId

Body: UpdateFormSchemaRequest
{
  "title": "Updated Evacuation Form",
  "description": "Updated description",
  "fields": [
    {
      "id": "name",
      "type": "text",
      "label": "Full Name",
      "required": true,
      "default": "",
      "validation": {
        "minLength": 2,
        "maxLength": 100
      },
      "ui": {
        "className": "form-control"
      },
      "visibility": {
        "condition": null
      },
      "meta": {
        "tags": ["personal-info"],
        "order": 1
      }
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email",
      "required": true,
      "default": "",
      "validation": {
        "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      },
      "ui": {
        "className": "form-control"
      },
      "visibility": {
        "condition": null
      },
      "meta": {
        "tags": ["contact-info"],
        "order": 2
      }
    }
  ]
}

Response: FormSchemaResponse<FormSchemaData> (200 OK)
{
  "data": {
    "id": "schema-123",
    "title": "Updated Evacuation Form",
    "description": "Updated description",
    "formKey": "evacuation-form",
    "status": "DRAFT",
    "fields": [
      {
        "id": "name",
        "type": "text",
        "label": "Full Name",
        "required": true,
        "default": "",
        "validation": {
          "minLength": 2,
          "maxLength": 100
        },
        "ui": {
          "className": "form-control"
        },
        "visibility": {
          "condition": null
        },
        "meta": {
          "tags": ["personal-info"],
          "order": 1
        }
      },
      {
        "id": "email",
        "type": "email",
        "label": "Email",
        "required": true,
        "default": "",
        "validation": {
          "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
        },
        "ui": {
          "className": "form-control"
        },
        "visibility": {
          "condition": null
        },
        "meta": {
          "tags": ["contact-info"],
          "order": 2
        }
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-17T14:45:00Z"
  },
  "code": "SCHEMA_UPDATED",
  "message": "Form schema updated successfully"
}
```

#### Delete Schema
```
DELETE /api/admin/forms/schemas/:schemaId

Response: FormSchemaResponse (200 OK)
{
  "code": "SCHEMA_DELETED",
  "message": "Form schema deleted successfully"
}
```

#### Publish Schema
```
POST /api/admin/forms/schemas/:schemaId/publish

Response: FormSchemaResponse<FormSchemaData> (200 OK)
{
  "data": {
    "id": "schema-123",
    "title": "Evacuation Registration Form",
    "description": "Form for evacuation center registration",
    "formKey": "evacuation-form",
    "status": "PUBLISHED",
    "fields": [...],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-17T15:00:00Z",
    "publishedAt": "2024-01-17T15:00:00Z"
  },
  "code": "SCHEMA_PUBLISHED",
  "message": "Form schema published successfully"
}
```

### Submission Review

#### Get All Submissions
```
GET /api/admin/forms/submissions
Query Parameters:
  - schemaId: string
  - status: SubmissionStatus (SUBMITTED, REVIEWED, APPROVED, REJECTED)
  - limit: number (default: 10)
  - page: number (default: 1)

Response: PaginatedResponse<SubmissionData>
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
        "userId": "user-457",
        "formKey": "evacuation-form",
        "status": "APPROVED",
        "data": {
          "name": "Jane Smith",
          "email": "jane@example.com",
          "phone": "+63-912-345-6790"
        },
        "notes": "Approved for evacuation center assignment",
        "submittedAt": "2024-01-16T14:30:00Z",
        "reviewedAt": "2024-01-17T09:00:00Z",
        "createdAt": "2024-01-16T14:30:00Z",
        "updatedAt": "2024-01-17T09:00:00Z"
      }
    ],
    "meta": {
      "totalCount": 150,
      "page": 1,
      "limit": 10
    }
  }
}
```

#### Get Submission Statistics
```
GET /api/admin/forms/submissions/stats
Query Parameters:
  - schemaId: string (optional)
  - status: string (optional)

Response: (200 OK)
{
  "totalSubmissions": 150,
  "submittedCount": 45,
  "reviewedCount": 80,
  "approvedCount": 60,
  "rejectedCount": 20,
  "approvalRate": 75,
  "pendingReview": 45
}
```

#### Get Submission by ID
```
GET /api/admin/forms/submissions/:submissionId

Response: SubmissionResponse<SubmissionData> (200 OK)
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

#### Update Submission Status
```
PUT /api/admin/forms/submissions/:submissionId/status

Body:
{
  "status": "APPROVED",
  "notes": "Approved for evacuation center assignment"
}

Response: SubmissionResponse<SubmissionData> (200 OK)
{
  "data": {
    "id": "sub-123",
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
    "submittedAt": "2024-01-17T10:15:00Z",
    "reviewedAt": "2024-01-17T15:30:00Z",
    "createdAt": "2024-01-17T10:15:00Z",
    "updatedAt": "2024-01-17T15:30:00Z"
  },
  "code": "SUBMISSION_UPDATED",
  "message": "Submission status updated successfully"
}
```

#### Delete Submission
```
DELETE /api/admin/forms/submissions/:submissionId

Response: SubmissionResponse (200 OK)
{
  "code": "SUBMISSION_DELETED",
  "message": "Submission deleted successfully"
}
```

### Draft Management

#### Get All Drafts
```
GET /api/admin/forms/drafts
Query Parameters:
  - schemaId: string (optional)
  - limit: number (default: 10)
  - page: number (default: 1)

Response: PaginatedResponse<DraftData> (200 OK)
{
  "data": {
    "items": [
      {
        "id": "draft-101",
        "schemaId": "schema-123",
        "userId": "user-789",
        "formKey": "evacuation-form",
        "data": {
          "name": "Alice Johnson",
          "email": "alice@example.com"
        },
        "completion": 50,
        "expiresAt": "2024-02-16T14:30:00Z",
        "createdAt": "2024-01-17T14:30:00Z",
        "updatedAt": "2024-01-17T15:45:00Z"
      },
      {
        "id": "draft-102",
        "schemaId": "schema-123",
        "userId": "user-790",
        "formKey": "evacuation-form",
        "data": {
          "name": "Bob Wilson",
          "email": "bob@example.com",
          "phone": "+63-912-345-6791"
        },
        "completion": 75,
        "expiresAt": "2024-02-17T10:00:00Z",
        "createdAt": "2024-01-17T10:00:00Z",
        "updatedAt": "2024-01-17T16:20:00Z"
      }
    ],
    "meta": {
      "totalCount": 35,
      "page": 1,
      "limit": 10
    }
  }
}
```

#### Get Draft by ID
```
GET /api/admin/forms/drafts/:draftId

Response: DraftResponse<DraftData> (200 OK)
{
  "data": {
    "id": "draft-101",
    "schemaId": "schema-123",
    "userId": "user-789",
    "formKey": "evacuation-form",
    "data": {
      "name": "Alice Johnson",
      "email": "alice@example.com"
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

#### Delete Draft
```
DELETE /api/admin/forms/drafts/:draftId

Response: DraftResponse (200 OK)
{
  "code": "DRAFT_DELETED",
  "message": "Draft deleted successfully"
}
```

### Form Validation

#### Validate Form Data
```
POST /api/admin/forms/validate

Body:
{
  "schemaId": "schema-123",
  "formKey": "evacuation-form",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+63-912-345-6789"
  }
}

Response: ValidationResponse (200 OK) - Valid
{
  "isValid": true,
  "errors": [],
  "code": "VALIDATION_PASSED",
  "message": "Form data is valid"
}

Response: ValidationResponse (400 Bad Request) - Invalid
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

## Implementation Details

### FormField Structure

Complete FormField interface with all supported properties aligned with Frontend expectations:

```typescript
interface VisibilityCondition {
  field: string;                                // Field ID to watch
  // Supports both frontend short codes and backend long names
  operator: 'eq' | 'equals' |                  // Equality check
            'neq' | 'notEquals' |               // Inequality check
            'gt' | 'greaterThan' |              // Greater than
            'gte' | 'greaterThanOrEqual' |      // Greater than or equal
            'lt' | 'lessThan' |                 // Less than
            'lte' | 'lessThanOrEqual' |         // Less than or equal
            'in' |                              // Value in array
            'notIn' |                           // Value not in array
            'contains' |                        // String contains substring
            'empty' |                           // Field is empty
            'notEmpty';                         // Field is not empty
  value?: any;                                  // Value to compare against
}

interface FormFieldValidation {
  minLength?: number;                          // Min length for text fields
  maxLength?: number;                          // Max length for text fields
  min?: number;                                // Min value for number fields
  max?: number;                                // Max value for number fields
  pattern?: string;                            // Regex validation pattern
  maxSizeMB?: number;                          // Max file size in MB
  allowedTypes?: string[];                     // MIME types for file uploads
}

interface FormFieldUI {
  width?: string;                              // CSS width (e.g., '50%', '100%')
  hint?: string;                               // Helper text below field
  placeholder?: string;                        // Placeholder text
}

interface FormFieldVisibility {
  when?: Array<{
    field: string;                             // Field ID to watch
    operator: string;                          // Comparison operator
    value?: any;                               // Value to compare
  }>;
}

interface FormField {
  // Core Properties
  id: string;                                  // Unique field identifier
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'time' | 'datetime' | 
        'select' | 'radio' | 'checkbox' | 'file' | 'image' | 'section' | 
        'divider' | 'info';                   // Field type
  label: string;                               // Display label
  required: boolean;                           // Is field required
  
  // Optional Display Properties
  placeholder?: string;                        // Placeholder text
  default?: any;                               // Default value
  options?: Array<{                            // For select/radio/checkbox
    value: string | number;
    label: string;
  }>;
  
  // Validation Configuration
  validation?: FormFieldValidation;            // See FormFieldValidation above
  
  // UI Customization
  ui?: FormFieldUI;                            // See FormFieldUI above
  
  // Visibility & Conditional Logic
  visibility?: FormFieldVisibility;            // See FormFieldVisibility above
  
  // Metadata & Tagging
  meta?: {
    tags?: string[];                           // Field tags/categories
    [key: string]: any;                        // Custom metadata
  };
}
```

### Example: Complete FormField with All Properties (FE Aligned)

```json
{
  "id": "evacuation_center",
  "type": "select",
  "label": "Evacuation Center",
  "required": true,
  "placeholder": "Select evacuation center",
  "default": "metro-manila",
  "options": [
    {
      "value": "metro-manila",
      "label": "Metro Manila Evacuation Center"
    },
    {
      "value": "calabarzon",
      "label": "Calabarzon Evacuation Center"
    }
  ],
  "validation": {
    "pattern": "^[a-z-]+$"
  },
  "ui": {
    "width": "100%",
    "hint": "Choose your nearest evacuation center",
    "placeholder": "Select location"
  },
  "visibility": {
    "when": [
      {
        "field": "province",
        "operator": "notEquals",
        "value": "other"
      }
    ]
  },
  "meta": {
    "tags": ["location", "evacuation"],
    "priority": "high",
    "order": 2
  }
}
```

### Example: Number Field with Min/Max Validation

```json
{
  "id": "family_members",
  "type": "number",
  "label": "Number of Family Members",
  "required": true,
  "placeholder": "Enter number",
  "default": 1,
  "validation": {
    "min": 1,
    "max": 20
  },
  "ui": {
    "width": "50%",
    "hint": "Total members to be evacuated"
  },
  "meta": {
    "tags": ["evacuation", "family"],
    "order": 3
  }
}
```

### Example: File Upload Field

```json
{
  "id": "identification",
  "type": "file",
  "label": "Upload ID Document",
  "required": true,
  "placeholder": "Choose file",
  "validation": {
    "maxSizeMB": 5,
    "allowedTypes": ["application/pdf", "image/jpeg", "image/png"]
  },
  "ui": {
    "width": "100%",
    "hint": "Accepted formats: PDF, JPG, PNG (Max 5MB)"
  },
  "visibility": {
    "when": [
      {
        "field": "has_valid_id",
        "operator": "equals",
        "value": true
      }
    ]
  },
  "meta": {
    "tags": ["identity", "required-doc"],
    "order": 4
  }
}
```

### File Structure
```
src/modules/submission/
├── submission.routes.ts          # Route definitions
├── submission.controller.ts       # Request handlers
└── submission.aggregator.ts       # Business logic & client wrapper
```

### Dependencies
- **SubmissionServiceClient**: HTTP client for submission microservice
- **SubmissionAggregator**: Utility functions for data operations
- **authContextMiddleware**: JWT authentication
- **requireRole('ADMIN')**: Role-based access control

### Authentication
All endpoints require:
1. Valid JWT token in `Authorization` header
2. ADMIN role in user context
3. Internal service authentication via SUBMISSION_SERVICE_URL

### Configuration

Update `.env` file:
```env
SUBMISSION_SERVICE_URL=  # Local development
# or
SUBMISSION_SERVICE_URL=http://govph-submission:3006  # Docker
```

## Usage Examples

### Create a Form Schema
```typescript
const response = await fetch('/api/admin/forms/schemas', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Evacuation Registration',
    description: 'Register for evacuation center',
    formKey: 'evacuation-registration',
    fields: [
      {
        id: 'full_name',
        type: 'text',
        label: 'Full Name',
        required: true,
        placeholder: 'Enter your full name'
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true
      },
      {
        id: 'phone',
        type: 'tel',
        label: 'Phone Number',
        required: true
      }
    ]
  })
});
```

### Review Submissions
```typescript
// Get submissions awaiting review
const response = await fetch(
  '/api/admin/forms/submissions?status=SUBMITTED',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const submissions = await response.json();

// Approve a submission
const approve = await fetch(
  `/api/admin/forms/submissions/${submissionId}/status`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'APPROVED',
      notes: 'Approved for evacuation center assignment'
    })
  }
);
```

### Dashboard Stats
```typescript
const statsResponse = await fetch(
  '/api/admin/forms/submissions/stats',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const stats = await statsResponse.json();

console.log(`Approval Rate: ${stats.approvalRate}%`);
console.log(`Pending Review: ${stats.pendingReview}`);
console.log(`Total Submissions: ${stats.totalSubmissions}`);
```

## Error Handling

All endpoints follow standard error response format:

```typescript
interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
}
```

Common status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## Security

1. **Authentication**: JWT tokens required for all endpoints
2. **Authorization**: ADMIN role required
3. **Token Propagation**: User context passed to submission service
4. **Error Masking**: Sensitive information not exposed in errors

## Field Types Supported

- `text` - Single line text
- `email` - Email validation
- `tel` - Phone number
- `number` - Numeric input
- `date` - Date picker
- `time` - Time picker
- `datetime` - DateTime picker
- `select` - Dropdown selection
- `radio` - Radio button group
- `checkbox` - Checkbox group
- `file` - File upload
- `image` - Image upload
- `section` - Section header
- `divider` - Visual divider
- `info` - Info display

## Submission Status Flow

```
SUBMITTED
    ↓
REVIEWED (admin reviews submission)
    ├→ APPROVED (accepted)
    └→ REJECTED (denied with notes)
```

## Integration with Other Services

- **Identity Service**: User authentication and roles
- **Geo Service**: City/location information (if needed)
- **SOS Service**: Emergency response integration (future)

## Testing

### Local Testing
```bash
# Start submission service
docker-compose up -d submission-service

# Start bff-admin
npm run dev

# Test endpoints
curl -X GET http://localhost:3002/api/admin/forms/schemas \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mock Data
The submission service includes seed data for testing in local environment. See `services/submission-service/SEEDING.md` for details.

## Troubleshooting

### Connection Issues
- Verify SUBMISSION_SERVICE_URL in .env
- Check submission-service is running: `docker ps | grep submission`
- Check network connectivity: `docker network inspect gov-ph-network`

### Authentication Errors
- Verify JWT token is valid and not expired
- Check Authorization header format: `Bearer <token>`
- Verify user has ADMIN role

### Validation Errors
- Check field types match schema definition
- Verify required fields are provided
- Use `/api/admin/forms/validate` endpoint to debug

## Next Steps

1. Create frontend forms using schema definitions
2. Implement submission dashboard
3. Add email notifications for status changes
4. Create reporting and analytics views
