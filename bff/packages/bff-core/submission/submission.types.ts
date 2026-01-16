/**
 * Submission Service Types
 * Interfaces for form schemas, submissions, drafts, and validations
 */

// ==================== Field Types ====================

export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;                                 // For number fields
  max?: number;                                 // For number fields
  pattern?: string;
  maxSizeMB?: number;                           // For file uploads
  allowedTypes?: string[];                      // For file uploads
}

export interface FormFieldOption {
  value: string | number;
  label: string;
}

export interface FormFieldUI {
  width?: string;                               // CSS width (e.g., '50%', '100%')
  hint?: string;                                // Helper text below field
  placeholder?: string;                         // Placeholder text
}

export interface VisibilityCondition {
  field: string;                                // Field ID to watch
  // Support both frontend short codes and backend long names
  operator: 'eq' | 'equals' | 'neq' | 'notEquals' | 'gt' | 'greaterThan' | 
            'gte' | 'greaterThanOrEqual' | 'lt' | 'lessThan' | 'lte' | 'lessThanOrEqual' |
            'in' | 'notIn' | 'contains' | 'empty' | 'notEmpty';
  value?: any;                                  // Value to compare against
}

export interface FormFieldVisibility {
  when?: VisibilityCondition[];                 // Array of conditions (AND logic)
}

export interface FormField {
  id: string;
  type:
    | 'text'
    | 'email'
    | 'tel'
    | 'number'
    | 'date'
    | 'time'
    | 'datetime'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'file'
    | 'image'
    | 'section'
    | 'divider'
    | 'info';
  label: string;
  required: boolean;
  placeholder?: string;
  default?: any;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  ui?: FormFieldUI;
  meta?: Record<string, any>;
  visibility?: FormFieldVisibility;
}

// ==================== Form Schema ====================

export type SchemaStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface FormSchemaData {
  _id?: string;
  formKey: string;
  version: number;
  status: SchemaStatus;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  publishedAt?: string;
}

export interface CreateFormSchemaRequest {
  formKey: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface UpdateFormSchemaRequest {
  title?: string;
  description?: string;
  fields?: FormField[];
}

export interface FormSchemaResponse<T = FormSchemaData> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: string;
}

// ==================== Submissions ====================

export type SubmissionStatus = 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';

export interface SubmissionData {
  _id?: string;
  schemaId: string;
  formKey: string;
  data: Record<string, any>;
  status: SubmissionStatus;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface CreateSubmissionRequest {
  schemaId: string;
  formKey: string;
  data: Record<string, any>;
}

export interface UpdateSubmissionRequest {
  status?: SubmissionStatus;
  data?: Record<string, any>;
  notes?: string;
}

export interface SubmissionResponse<T = SubmissionData> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: string;
}

// ==================== Drafts ====================

export interface DraftData {
  _id?: string;
  schemaId: string;
  formKey: string;
  data: Record<string, any>;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  expiresAt: string;
}

export interface CreateDraftRequest {
  schemaId: string;
  formKey: string;
  data: Record<string, any>;
}

export interface UpdateDraftRequest {
  data: Record<string, any>;
}

export interface DraftResponse<T = DraftData> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: string;
}

// ==================== Validations ====================

export interface ValidationError {
  [fieldId: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  data: Record<string, any>;
  errors: ValidationError;
}

export interface ValidateFormDataRequest {
  schemaId: string;
  data: Record<string, any>;
}

export interface ValidationResponse {
  success: boolean;
  data?: ValidationResult;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: string;
}

// ==================== Pagination ====================

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: {
    items: T[];
    meta: PaginationMeta;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// ==================== List Filters ====================

export interface ListSchemasFilters {
  skip?: number;
  limit?: number;
  status?: SchemaStatus;
  formKey?: string;
}

export interface ListSubmissionsFilters {
  skip?: number;
  limit?: number;
  schemaId?: string;
  status?: SubmissionStatus;
  formKey?: string;
}

export interface ListDraftsFilters {
  skip?: number;
  limit?: number;
  schemaId?: string;
  formKey?: string;
}
