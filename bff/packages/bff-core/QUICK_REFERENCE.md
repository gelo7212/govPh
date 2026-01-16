# Submission Service Client - Quick Reference

## Installation

```typescript
import { SubmissionServiceClient } from '@gov-ph/bff-core';

const client = new SubmissionServiceClient(
  'http://submission-service:3006',
  { authorization: token }
);
```

## Quick API Reference

### Schemas (Forms)

```typescript
// List
await client.getAllSchemas({ status: 'PUBLISHED' }, token);

// Get
await client.getSchemaById(id, token);

// Create
await client.createSchema({
  formKey: 'permit_form',
  title: 'Permit Application',
  fields: [...]
}, token);

// Update
await client.updateSchema(id, { title: 'Updated Title' }, token);

// Delete
await client.deleteSchema(id, token);

// Publish
await client.publishSchema(id, token);
```

### Submissions (Responses)

```typescript
// List
await client.getAllSubmissions({ schemaId, status: 'SUBMITTED' }, token);

// Get
await client.getSubmissionById(id, token);

// Create
await client.createSubmission({
  schemaId,
  formKey,
  data: { field1: 'value1', ... }
}, token);

// Update (approve/reject)
await client.updateSubmission(id, {
  status: 'APPROVED',
  notes: 'Approved'
}, token);

// Delete
await client.deleteSubmission(id, token);
```

### Drafts (Auto-Save)

```typescript
// List
await client.getAllDrafts({ schemaId }, token);

// Get
await client.getDraftById(id, token);

// Save/Update
await client.saveDraft({
  schemaId,
  formKey,
  data: { field1: 'partial value' }
}, token);

// Update
await client.updateDraft(id, { data: {...} }, token);

// Delete
await client.deleteDraft(id, token);
```

### Validations

```typescript
// Validate
await client.validateFormData({
  schemaId,
  data: { field1: 'value1', ... }
}, token);
```

## Response Pattern

```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: string;
}
```

## Form Field Types

```
text, email, tel, number, date, time, datetime,
select, radio, checkbox, file, image,
section, divider, info
```

## Submission Status Flow

```
SUBMITTED → REVIEWED → APPROVED ✓
                    → REJECTED ✗
```

## Common Patterns

### Validate before submit

```typescript
const validation = await client.validateFormData({schemaId, data}, token);
if (validation.data?.isValid) {
  await client.createSubmission({schemaId, formKey, data}, token);
}
```

### Auto-save draft

```typescript
await client.saveDraft({schemaId, formKey, data}, token);
// Called repeatedly as user types
// Smart: creates new or updates existing per user+schema
```

### Review workflow

```typescript
const submissions = await client.getAllSubmissions(
  {status: 'SUBMITTED'}, 
  adminToken
);

for (const submission of submissions.data?.items || []) {
  // Review...
  await client.updateSubmission(submission._id, {
    status: 'APPROVED',
    notes: 'Approved'
  }, adminToken);
}
```

## Utilities

```typescript
import { SubmissionAggregator } from '@gov-ph/bff-core';

// Completion percentage
SubmissionAggregator.calculateCompletion(schema, draftData); // 0-100

// Missing fields
SubmissionAggregator.getMissingRequiredFields(schema, draftData);

// Format for display
SubmissionAggregator.formatSubmissionForDisplay(submission, schema);

// Statistics
SubmissionAggregator.getSubmissionStats(submissions);

// Check if draft expires soon
SubmissionAggregator.isDraftStale(draft, 24); // expires in <24h?
```

## Errors

| Code | Status | Meaning |
|------|--------|---------|
| VALIDATION_ERROR | 400 | Invalid input |
| SCHEMA_NOT_FOUND | 404 | Schema doesn't exist |
| SUBMISSION_NOT_FOUND | 404 | Submission doesn't exist |
| DRAFT_NOT_FOUND | 404 | Draft doesn't exist |
| SCHEMA_ALREADY_PUBLISHED | 409 | Can't update published |
| DATABASE_ERROR | 500 | DB operation failed |
| EXTERNAL_SERVICE_ERROR | 502 | Service error |

## Environment

```env
SUBMISSION_SERVICE_URL=http://submission-service:3006
INTERNAL_AUTH_TOKEN=your_token
```

## Types

```typescript
// Schemas
FormSchemaData, CreateFormSchemaRequest, UpdateFormSchemaRequest

// Submissions
SubmissionData, CreateSubmissionRequest, UpdateSubmissionRequest

// Drafts
DraftData, CreateDraftRequest, UpdateDraftRequest

// Validation
ValidationResult, ValidateFormDataRequest

// Pagination
PaginatedResponse<T>, ListSchemasFilters, ListSubmissionsFilters

// Status
SchemaStatus, SubmissionStatus
```

## Examples

### Admin: Create and publish form
```typescript
const schema = await client.createSchema({
  formKey: 'permit',
  title: 'Permit Application',
  fields: [{id: 'name', type: 'text', label: 'Name', required: true}]
}, token);

await client.publishSchema(schema.data._id, token);
```

### Citizen: Submit form with draft
```typescript
// Save draft
const draft = await client.saveDraft({
  schemaId, formKey, data: {name: 'John'}
}, token);

// Validate
const validation = await client.validateFormData({
  schemaId, data: {name: 'John', email: 'john@example.com'}
}, token);

// Submit
const submission = await client.createSubmission({
  schemaId, formKey, data: {name: 'John', email: 'john@example.com'}
}, token);

// Clean up
await client.deleteDraft(draft.data._id, token);
```

### Admin: Review submissions
```typescript
const list = await client.getAllSubmissions(
  {schemaId, status: 'SUBMITTED', limit: 50},
  token
);

for (const sub of list.data?.items || []) {
  const detail = await client.getSubmissionById(sub._id, token);
  
  if (isValid(detail.data?.data)) {
    await client.updateSubmission(sub._id, {
      status: 'APPROVED',
      notes: 'OK'
    }, token);
  }
}
```

---

**Quick Links:**
- [Full Guide](./SUBMISSION_CLIENT_GUIDE.md)
- [BFF Examples](./SUBMISSION_BFF_EXAMPLES.md)
- [API Spec](../services/submission-service/API_SPEC.md)
