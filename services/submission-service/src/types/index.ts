import { Request } from 'express';

export interface User {
  userId?: string;
  id: string; // userId from identity.userId
  email?: string;
  role?: string; // Single role from identity.role
  firebaseUid?: string; // Firebase UID from identity.firebaseUid
  actor?: {
    type: string; // USER, ANON, etc.
    cityCode: string;
  };
}

/**
 * Request context with user information
 */
export interface RequestContext {
  user?: User;
  requestId: string;
  timestamp: Date;
}

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}

/**
 * Standard API Response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: Date;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Form Field Validation Rules
 */
export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;                                 // For number fields
  max?: number;                                 // For number fields
  pattern?: string;
  maxSizeMB?: number;                           // For file uploads
  allowedTypes?: string[];                      // For file uploads (MIME types)
}

/**
 * Form Field Option (for select, radio, checkbox)
 */
export interface FormFieldOption {
  value: string | number;
  label: string;
}

/**
 * Form Field UI Configuration
 */
export interface FormFieldUI {
  width?: string;                               // CSS width (e.g., '50%', '100%')
  hint?: string;                                // Helper text below field
  placeholder?: string;                         // Placeholder text
}

/**
 * Visibility Condition for Conditional Logic
 */
export interface VisibilityCondition {
  field: string;                                // Field ID to watch
  // Support both frontend short codes and backend long names
  operator: 'eq' | 'equals' | 'neq' | 'notEquals' | 'gt' | 'greaterThan' | 
            'gte' | 'greaterThanOrEqual' | 'lt' | 'lessThan' | 'lte' | 'lessThanOrEqual' |
            'in' | 'notIn' | 'contains' | 'empty' | 'notEmpty';
  value?: any;                                  // Value to compare against
}

/**
 * Form Field Visibility/Conditional Logic
 */
export interface FormFieldVisibility {
  when?: VisibilityCondition[];                 // Array of conditions (AND logic)
}

/**
 * Complete Form Field Definition
 */
export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'time' | 'datetime' | 
        'select' | 'radio' | 'checkbox' | 'file' | 'image' | 'section' | 'divider' | 'info';
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
