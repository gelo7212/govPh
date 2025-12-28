/**
 * Custom Error Classes for SOS Service
 */

export class SOSServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'SOSServiceError';
  }
}

/**
 * Validation Errors
 */
export class ValidationError extends SOSServiceError {
  constructor(
    message: string,
    public field?: string
  ) {
    super('VALIDATION_ERROR', message, 400);
  }
}

/**
 * Authorization Errors
 */
export class UnauthorizedError extends SOSServiceError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends SOSServiceError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class InsufficientPermissionError extends SOSServiceError {
  constructor(
    public requiredRole: string,
    public userRole: string
  ) {
    super(
      'INSUFFICIENT_PERMISSION',
      `User role '${userRole}' does not have permission. Required: '${requiredRole}'`,
      403
    );
  }
}

/**
 * Resource Errors
 */
export class NotFoundError extends SOSServiceError {
  constructor(
    public resource: string,
    public identifier?: string
  ) {
    super(
      'NOT_FOUND',
      `${resource} not found${identifier ? `: ${identifier}` : ''}`,
      404
    );
  }
}

export class ConflictError extends SOSServiceError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

/**
 * Business Logic Errors
 */
export class InvalidStateTransitionError extends SOSServiceError {
  constructor(
    public currentState: string,
    public requestedState: string
  ) {
    super(
      'INVALID_STATE_TRANSITION',
      `Cannot transition from '${currentState}' to '${requestedState}'`,
      400
    );
  }
}

/**
 * Error Response Handler
 */
export function getErrorResponse(error: unknown): {
  code: string;
  message: string;
  statusCode: number;
} {
  if (error instanceof SOSServiceError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message,
      statusCode: 500,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}
