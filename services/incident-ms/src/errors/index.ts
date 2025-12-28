/**
 * Custom Error Classes for Incident Service
 */

export class IncidentServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'IncidentServiceError';
  }
}

/**
 * Validation Errors
 */
export class ValidationError extends IncidentServiceError {
  constructor(message: string = 'Validation failed') {
    super('VALIDATION_ERROR', message, 400);
  }
}

/**
 * Authentication & Authorization Errors
 */
export class UnauthorizedError extends IncidentServiceError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends IncidentServiceError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

/**
 * Resource Errors
 */
export class NotFoundError extends IncidentServiceError {
  constructor(resource: string = 'Resource', identifier?: string) {
    const message = identifier
      ? `${resource} with id '${identifier}' not found`
      : `${resource} not found`;
    super('NOT_FOUND', message, 404);
  }
}

export class ConflictError extends IncidentServiceError {
  constructor(message: string = 'Conflict') {
    super('CONFLICT', message, 409);
  }
}

/**
 * Business Logic Errors
 */
export class InvalidIncidentStatusError extends IncidentServiceError {
  constructor(currentStatus: string, attemptedStatus: string) {
    super(
      'INVALID_STATUS_TRANSITION',
      `Cannot transition from '${currentStatus}' to '${attemptedStatus}'`,
      400
    );
  }
}

export class IncidentAlreadyAssignedError extends IncidentServiceError {
  constructor(incidentId: string) {
    super(
      'ALREADY_ASSIGNED',
      `Incident '${incidentId}' is already assigned`,
      409
    );
  }
}

/**
 * Database Errors
 */
export class DatabaseError extends IncidentServiceError {
  constructor(message: string = 'Database operation failed') {
    super('DATABASE_ERROR', message, 500);
  }
}

/**
 * Error Response Handler
 */
export function getErrorResponse(error: any) {
  if (error instanceof IncidentServiceError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
      statusCode: error.statusCode,
    };
  }

  // Default error response
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    statusCode: 500,
  };
}
