# Submission Module - BFF Core Reference

## Overview
The submission module in `bff-core` provides comprehensive types and aggregators for handling form schemas, submissions, and drafts. This module is used by `bff-admin` and `bff-citizen` to manage form-based data collection.

## File Structure
```
submission/
├── index.ts                     # Module exports
├── submission.types.ts          # Type definitions
└── submission.aggregator.ts     # Data aggregation utilities
```

## Key Types

### Form Schema Management
- **FormField**: Individual form field definition with validation and visibility rules
- **FormSchemaData**: Complete form schema with metadata
- **SchemaStatus**: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
- **CreateFormSchemaRequest**: Request to create a new schema
- **UpdateFormSchemaRequest**: Request to update existing schema

### Submissions
- **SubmissionData**: User-submitted form data
- **SubmissionStatus**: 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED'
- **CreateSubmissionRequest**: Request to create a submission
- **UpdateSubmissionRequest**: Request to update submission (status, notes, etc.)

### Drafts
- **DraftData**: Incomplete form data (auto-saves)
- **CreateDraftRequest**: Request to create a draft
- **UpdateDraftRequest**: Request to update draft data

### Validation
- **ValidationResult**: Contains validation status and error details
- **ValidateFormDataRequest**: Request to validate form data
- **ValidationError**: Field-level error mapping

### Pagination
- **PaginatedResponse<T>**: Standard paginated response wrapper
- **ListSchemasFilters**: Filters for schema listing
- **ListSubmissionsFilters**: Filters for submission listing
- **ListDraftsFilters**: Filters for draft listing

## Aggregator Class
The `SubmissionAggregator` provides data transformation utilities:
- `enrichSubmissionWithSchema()`: Combines submission data with schema info
- `formatSubmissionForDisplay()`: Formats submission using schema field labels

## Integration Points

### Admin Usage (bff-admin)
Used in [AdminSubmissionController](../../../bff/bff-admin/src/modules/submission/submission.controller.ts) for:
- Schema management and publishing
- Submission review and approval
- Draft management

### Citizen Usage (bff-citizen)
Used for:
- Viewing available form schemas
- Creating and updating submissions
- Managing drafts
- Form data validation

## Response Format
All responses follow a standard format:
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

## Field Validation
Form fields support comprehensive validation rules:
- `minLength`, `maxLength`: String length constraints
- `min`, `max`: Numeric range constraints
- `pattern`: Regex validation
- `maxSizeMB`, `allowedTypes`: File upload constraints
- Custom visibility conditions with operators (eq, neq, gt, gte, lt, lte, in, contains, empty, etc.)

## Status Flow
### Schema Status
1. DRAFT - Form under development
2. PUBLISHED - Available for submissions
3. ARCHIVED - No longer accepting submissions

### Submission Status
1. SUBMITTED - Initial state
2. REVIEWED - Under admin review
3. APPROVED - Approved by admin
4. REJECTED - Rejected with notes
