/**
 * Custom Error Classes for Identity Service
 */

export class IdentityServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'IdentityServiceError';
  }
}

/**
 * Authentication Errors
 */
export class UnauthorizedError extends IdentityServiceError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class InvalidTokenError extends IdentityServiceError {
  constructor(message: string = 'Invalid token') {
    super('INVALID_TOKEN', message, 401);
  }
}

/**
 * Authorization Errors
 */
export class ForbiddenError extends IdentityServiceError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class InsufficientPermissionError extends IdentityServiceError {
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

export class MunicipalityAccessDeniedError extends IdentityServiceError {
  constructor(
    public userMunicipality: string,
    public requestedMunicipality: string
  ) {
    super(
      'MUNICIPALITY_ACCESS_DENIED',
      `Cannot access municipality '${requestedMunicipality}'. User is scoped to '${userMunicipality}'`,
      403
    );
  }
}

/**
 * Validation Errors
 */
export class ValidationError extends IdentityServiceError {
  constructor(
    message: string,
    public field?: string
  ) {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class MissingMunicipalityCodeError extends IdentityServiceError {
  constructor(public role: string) {
    super(
      'MISSING_MUNICIPALITY_CODE',
      `Role '${role}' requires a valid municipalityCode`,
      400
    );
  }
}

export class UserNotRegisteredError extends IdentityServiceError {
  constructor(public firebaseUid: string) {
    super(
      'USER_NOT_REGISTERED',
      `No user registered with Firebase UID: ${firebaseUid}`,
      404
    );
  }
}

/**
 * Resource Errors
 */
export class NotFoundError extends IdentityServiceError {
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


export class UserAlreadyExistsError extends IdentityServiceError {
  constructor(public identifier: string) {
    super(
      'USER_ALREADY_EXISTS',
      `User already exists: ${identifier}`,
      409
    );
  }
}

/**
 * Business Logic Errors
 */
export class CannotCreateAdminError extends IdentityServiceError {
  constructor(
    public creatorRole: string,
    public targetRole: string
  ) {
    super(
      'CANNOT_CREATE_ADMIN',
      `Role '${creatorRole}' cannot create '${targetRole}' admins`,
      403
    );
  }
}

export class RescuerMissionExpiredError extends IdentityServiceError {
  constructor() {
    super(
      'RESCUER_MISSION_EXPIRED',
      'Rescuer mission has expired or been revoked',
      403
    );
  }
}

export class RescuerMissionNotFoundError extends IdentityServiceError {
  constructor(public sosId: string) {
    super(
      'RESCUER_MISSION_NOT_FOUND',
      `No valid rescuer mission found for SOS ${sosId}`,
      404
    );
  }
}

/**
 * Integration Errors
 */
export class FirebaseAuthError extends IdentityServiceError {
  constructor(message: string) {
    super('FIREBASE_AUTH_ERROR', `Firebase authentication failed: ${message}`, 401);
  }
}

export class DatabaseError extends IdentityServiceError {
  constructor(message: string) {
    super('DATABASE_ERROR', `Database operation failed: ${message}`, 500);
  }
}

/* SMS Errors */
export class SmsServiceError extends IdentityServiceError {
  constructor(message: string) {
    super('SMS_SERVICE_ERROR', `SMS service error: ${message}`, 500);
  }
}

export class SmsOtpVerificationError extends IdentityServiceError {
  constructor(message: string) {
    super('SMS_OTP_VERIFICATION_FAILED', message, 400);
  }
}

export class SmsOtpSendError extends IdentityServiceError {
  constructor(message: string) {
    super('SMS_OTP_SEND_FAILED', message, 500);
  }
}

export class SmsVerificationNumberMismatchError extends IdentityServiceError {
  constructor(message: string) {
    super('SMS_VERIFICATION_NUMBER_MISMATCH', message, 400);
  }
}

export class SmsOtpExpiredError extends IdentityServiceError {
  constructor(message: string) {
    super('SMS_OTP_EXPIRED', message, 400);
  }
}

export class VerificationGeneralError extends IdentityServiceError {
  constructor(message: string) {
    super('VERIFICATION_ERROR', message, 400);
  }
}

export class InternalServiceError extends IdentityServiceError {
  constructor(message: string) {
    super('INTERNAL_SERVICE_ERROR', message, 500);
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
  if (error instanceof IdentityServiceError) {
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
