# Submission Service Client Integration Guide

## Overview

The `SubmissionServiceClient` is a TypeScript client for communicating with the submission-service microservice. It's part of the bff-core package and provides complete API coverage for managing form schemas, submissions, drafts, and validations.

## Installation

The client is already integrated into bff-core. Import it from the package:

```typescript
import { SubmissionServiceClient } from '@gov-ph/bff-core';
```

## Initialization

### Basic Usage

```typescript
const submissionClient = new SubmissionServiceClient(
  'http://submission-service:3006',
  {
    userId: 'user_123',
    role: 'citizen',
    authorization: 'jwt_token_here'
  }
);
```

### With User Context

```typescript
import { UserContext } from '@gov-ph/bff-core';

const userContext: UserContext = {
  userId: 'user_456',
  role: 'admin',
  cityId: 'city_001',
  authorization: 'jwt_token'
};

const client = new SubmissionServiceClient(
  'http://submission-service:3006',
  userContext
);
```

## API Methods

### Form Schemas

#### Get All Schemas

```typescript
// Get all published schemas
const response = await submissionClient.getAllSchemas({
  status: 'PUBLISHED',
  skip: 0,
  limit: 20
}, token);

// Response: PaginatedResponse<FormSchemaData>
if (response.success) {
  console.log(response.data?.items);
  console.log(response.data?.meta); // pagination info
}
```

#### Get Single Schema

```typescript
const response = await submissionClient.getSchemaById(
  'schema_id_123',
  token
);

if (response.success) {
  const schema: FormSchemaData = response.data;
  console.log(schema.fields); // array of form fields
}
```

#### Create Schema

```typescript
import { CreateFormSchemaRequest } from '@gov-ph/bff-core';

const newSchema: CreateFormSchemaRequest = {
  formKey: 'employment_form',
  title: 'Employment Information',
  description: 'Please provide your employment details',
  fields: [
    {
      id: 'field_001',
      type: 'text',
      label: 'Full Name',
      required: true,
      placeholder: 'Enter your full name',
      validation: {
        minLength: 2,
        maxLength: 100
      }
    },
    {
      id: 'field_002',
      type: 'email',
      label: 'Email Address',
      required: true
    },
    {
      id: 'field_003',
      type: 'select',
      label: 'Department',
      required: true,
      options: [
        { value: 'hr', label: 'HR' },
        { value: 'it', label: 'IT' }
      ]
    }
  ]
};

const response = await submissionClient.createSchema(newSchema, token);
if (response.success) {
  const schema = response.data;
  console.log('Schema created:', schema._id);
}
```

#### Update Schema

```typescript
import { UpdateFormSchemaRequest } from '@gov-ph/bff-core';

const updates: UpdateFormSchemaRequest = {
  title: 'Updated Employment Form',
  description: 'Updated description'
};

const response = await submissionClient.updateSchema(
  'schema_id_123',
  updates,
  token
);
```

#### Publish Schema

```typescript
// Makes schema available for submissions
const response = await submissionClient.publishSchema(
  'schema_id_123',
  token
);

if (response.success) {
  console.log('Schema published'); // status is now 'PUBLISHED'
}
```

#### Delete Schema

```typescript
const response = await submissionClient.deleteSchema(
  'schema_id_123',
  token
);
```

### Form Submissions

#### Get All Submissions

```typescript
import { ListSubmissionsFilters } from '@gov-ph/bff-core';

const filters: ListSubmissionsFilters = {
  schemaId: 'schema_id_123',
  status: 'SUBMITTED',
  skip: 0,
  limit: 20
};

const response = await submissionClient.getAllSubmissions(filters, token);

if (response.success) {
  const submissions = response.data?.items;
  const meta = response.data?.meta; // pagination
}
```

#### Get Single Submission

```typescript
const response = await submissionClient.getSubmissionById(
  'submission_id_456',
  token
);

if (response.success) {
  const submission = response.data;
  console.log(submission.data); // form response data
  console.log(submission.status); // SUBMITTED, REVIEWED, APPROVED, REJECTED
}
```

#### Create Submission

```typescript
import { CreateSubmissionRequest } from '@gov-ph/bff-core';

const submission: CreateSubmissionRequest = {
  schemaId: 'schema_id_123',
  formKey: 'employment_form',
  data: {
    field_001: 'John Doe',
    field_002: 'john@example.com',
    field_003: 'hr'
  }
};

const response = await submissionClient.createSubmission(submission, token);

if (response.success) {
  console.log('Submission created:', response.data._id);
  console.log('Status:', response.data.status); // SUBMITTED
}
```

#### Update Submission

```typescript
import { UpdateSubmissionRequest } from '@gov-ph/bff-core';

// Admin approving a submission
const update: UpdateSubmissionRequest = {
  status: 'APPROVED',
  notes: 'All requirements met'
};

const response = await submissionClient.updateSubmission(
  'submission_id_456',
  update,
  adminToken
);
```

#### Allowed Status Transitions

```
SUBMITTED → REVIEWED, APPROVED, REJECTED
REVIEWED → APPROVED, REJECTED
APPROVED → (final)
REJECTED → (final)
```

#### Delete Submission

```typescript
const response = await submissionClient.deleteSubmission(
  'submission_id_456',
  token
);
```

### Drafts (Auto-Save)

#### Get All Drafts

```typescript
import { ListDraftsFilters } from '@gov-ph/bff-core';

const filters: ListDraftsFilters = {
  schemaId: 'schema_id_123',
  skip: 0,
  limit: 20
};

const response = await submissionClient.getAllDrafts(filters, token);
```

#### Get Single Draft

```typescript
const response = await submissionClient.getDraftById(
  'draft_id_789',
  token
);

if (response.success) {
  const draft = response.data;
  console.log('Progress:', draft.data); // partially filled form data
  console.log('Expires at:', draft.expiresAt); // 30-day TTL
}
```

#### Save Draft (Create or Update)

```typescript
import { CreateDraftRequest } from '@gov-ph/bff-core';

// Smart save: creates new draft or updates existing one per user+schema
const draft: CreateDraftRequest = {
  schemaId: 'schema_id_123',
  formKey: 'employment_form',
  data: {
    field_001: 'Jane Smith',
    field_002: 'jane@example.com'
    // field_003 not filled yet
  }
};

const response = await submissionClient.saveDraft(draft, token);

// Can be called multiple times as user fills the form
// Same user + schema = existing draft updated
```

#### Update Draft

```typescript
import { UpdateDraftRequest } from '@gov-ph/bff-core';

const update: UpdateDraftRequest = {
  data: {
    field_001: 'Jane Smith',
    field_002: 'jane@example.com',
    field_003: 'it' // now filled
  }
};

const response = await submissionClient.updateDraft(
  'draft_id_789',
  update,
  token
);
```

#### Delete Draft

```typescript
// Delete when user submits the form
const response = await submissionClient.deleteDraft(
  'draft_id_789',
  token
);
```

### Form Validation

#### Validate Form Data

```typescript
import { ValidateFormDataRequest } from '@gov-ph/bff-core';

const validation: ValidateFormDataRequest = {
  schemaId: 'schema_id_123',
  data: {
    field_001: 'John Doe',
    field_002: 'john@example.com',
    field_003: 'hr'
  }
};

const response = await submissionClient.validateFormData(validation, token);

if (response.success) {
  const result = response.data;
  
  if (result.isValid) {
    console.log('Form is valid, ready to submit');
  } else {
    console.log('Validation errors:', result.errors);
    // errors: { field_001: 'must be at least 2 characters', ... }
  }
}
```

## Usage Examples

### Complete Form Workflow

```typescript
// 1. Load form schema
const schemaResponse = await submissionClient.getSchemaById(schemaId, token);
const schema = schemaResponse.data;

// 2. Auto-save draft as user types
const saveDraftResponse = await submissionClient.saveDraft({
  schemaId,
  formKey: schema.formKey,
  data: formData
}, token);

// 3. Validate before submission
const validationResponse = await submissionClient.validateFormData({
  schemaId,
  data: formData
}, token);

if (!validationResponse.data?.isValid) {
  // Show validation errors to user
  return;
}

// 4. Submit the form
const submissionResponse = await submissionClient.createSubmission({
  schemaId,
  formKey: schema.formKey,
  data: formData
}, token);

if (submissionResponse.success) {
  // 5. Delete draft after successful submission
  await submissionClient.deleteDraft(draftId, token);
  console.log('Form submitted successfully');
}
```

### Admin Review Workflow

```typescript
// 1. Get pending submissions
const submissions = await submissionClient.getAllSubmissions({
  status: 'SUBMITTED'
}, adminToken);

// 2. Review individual submission
const submission = await submissionClient.getSubmissionById(
  submissionId,
  adminToken
);

console.log('Submitted by:', submission.data.createdBy);
console.log('Form data:', submission.data.data);

// 3. Approve or reject
const result = await submissionClient.updateSubmission(
  submissionId,
  {
    status: 'APPROVED',
    notes: 'Documentation verified'
  },
  adminToken
);
```

### Aggregator Usage

```typescript
import { SubmissionAggregator } from '@gov-ph/bff-core';

// Calculate form completion percentage
const completion = SubmissionAggregator.calculateCompletion(schema, draftData);
console.log(`Form is ${completion}% complete`);

// Get missing required fields
const missing = SubmissionAggregator.getMissingRequiredFields(schema, draftData);
console.log('Still need to fill:', missing.map(f => f.label));

// Format submission for display
const formatted = SubmissionAggregator.formatSubmissionForDisplay(
  submission,
  schema
);
console.log(formatted); // human-readable version

// Get submission stats
const stats = SubmissionAggregator.getSubmissionStats(allSubmissions);
console.log('Approval rate:', stats.approvalRate, '%');

// Check if draft is about to expire
const isStale = SubmissionAggregator.isDraftStale(draft, 24); // expires in 24h?
if (isStale) {
  console.log('Draft expires soon! Encourage user to save');
}
```

## Error Handling

```typescript
try {
  const response = await submissionClient.createSubmission(data, token);
  
  if (!response.success) {
    // API-level error
    console.error('Error:', response.error?.code);
    console.error('Message:', response.error?.message);
    
    if (response.error?.details) {
      // Field-level validation errors
      console.error('Details:', response.error.details);
    }
  } else {
    // Success
    const submission = response.data;
  }
} catch (error) {
  // Network or client error
  console.error('Request failed:', error);
}
```

## Response Types

All methods return typed responses:

```typescript
// Single resource responses
FormSchemaResponse<FormSchemaData>
SubmissionResponse<SubmissionData>
DraftResponse<DraftData>
ValidationResponse

// List responses
PaginatedResponse<FormSchemaData>
PaginatedResponse<SubmissionData>
PaginatedResponse<DraftData>

// All include:
{
  success: boolean;
  data?: T;
  error?: { code, message, details };
  timestamp: string;
}
```

## Available Types

```typescript
// Schemas
FormField, FormSchemaData, CreateFormSchemaRequest, UpdateFormSchemaRequest
SchemaStatus // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

// Submissions
SubmissionData, CreateSubmissionRequest, UpdateSubmissionRequest
SubmissionStatus // 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED'

// Drafts
DraftData, CreateDraftRequest, UpdateDraftRequest

// Validations
ValidationResult, ValidateFormDataRequest

// Pagination
PaginatedResponse, ListSchemasFilters, ListSubmissionsFilters, ListDraftsFilters
```

## Features

✅ Full CRUD operations for schemas, submissions, drafts  
✅ Real-time form validation  
✅ Draft auto-save with 30-day expiration  
✅ Status tracking for submissions  
✅ User context and authorization  
✅ JWT token support  
✅ Error handling and typed responses  
✅ Data aggregation utilities  
✅ Pagination support  

## Configuration

The client uses the following defaults:

- **Timeout**: 10 seconds
- **Base URL**: Set at initialization
- **Headers**: Includes internal auth token and user context

## Environment Variables

The client reads from process.env for internal authentication:

```env
INTERNAL_AUTH_TOKEN=your_internal_token
```

## Troubleshooting

### 401 Unauthorized
- Ensure JWT token is valid and not expired
- Check `authorization` in user context

### 404 Not Found
- Verify the resource ID exists
- Check for typos in IDs

### 400 Bad Request
- Check validation errors in response.error.details
- Ensure required fields are provided

### 409 Conflict
- Cannot update published schemas
- Check business logic constraints

## See Also

- [Submission Service API Spec](../services/submission-service/API_SPEC.md)
- [Form Builder Guide](../docs/FORM_BUILDER.md)
- [BFF Integration Patterns](./BFF_PATTERNS.md)
