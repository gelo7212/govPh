/**
 * Custom Error Classes for Submission Service
 */

export class SubmissionServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'SubmissionServiceError';
  }
}

/**
 * Validation Errors
 */
export class ValidationError extends SubmissionServiceError {
  constructor(
    message: string = 'Validation failed',
    public details?: Record<string, string>
  ) {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class InvalidSchemaError extends SubmissionServiceError {
  constructor(message: string = 'Invalid form schema') {
    super('INVALID_SCHEMA', message, 400);
  }
}

/**
 * Not Found Errors
 */
export class SchemaNotFoundError extends SubmissionServiceError {
  constructor(schemaId: string) {
    super(
      'SCHEMA_NOT_FOUND',
      `Form schema with ID '${schemaId}' not found`,
      404
    );
  }
}

export class SubmissionNotFoundError extends SubmissionServiceError {
  constructor(submissionId: string) {
    super(
      'SUBMISSION_NOT_FOUND',
      `Submission with ID '${submissionId}' not found`,
      404
    );
  }
}

export class DraftNotFoundError extends SubmissionServiceError {
  constructor(draftId: string) {
    super('DRAFT_NOT_FOUND', `Draft with ID '${draftId}' not found`, 404);
  }
}

/**
 * Authentication Errors
 */
export class UnauthorizedError extends SubmissionServiceError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

/**
 * Authorization Errors
 */
export class ForbiddenError extends SubmissionServiceError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

/**
 * Conflict Errors
 */
export class SchemaAlreadyPublishedError extends SubmissionServiceError {
  constructor(schemaId: string) {
    super(
      'SCHEMA_ALREADY_PUBLISHED',
      `Schema '${schemaId}' is already published`,
      409
    );
  }
}

/**
 * Database Errors
 */
export class DatabaseError extends SubmissionServiceError {
  constructor(message: string = 'Database operation failed') {
    super('DATABASE_ERROR', message, 500);
  }
}

/**
 * External Service Errors
 */
export class ExternalServiceError extends SubmissionServiceError {
  constructor(service: string, message: string = 'External service error') {
    super('EXTERNAL_SERVICE_ERROR', `${service}: ${message}`, 502);
  }
}

/**
 * Get standardized error response
 */
export interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, string>;
}

export function getErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof SubmissionServiceError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error instanceof ValidationError ? error.details : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
    };
  }

  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}
