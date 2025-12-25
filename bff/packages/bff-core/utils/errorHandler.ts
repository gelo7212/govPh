import { Response } from 'express';

export interface ErrorInfo {
  code: string;
  message: string;
  statusCode: number;
}

/**
 * Handle service errors consistently
 */
export function handleServiceError(
  error: unknown,
  defaultMessage: string
): ErrorInfo {
  const err = error as any;

  // Check if it's a ServiceError from BaseClient
  if (err.code && err.statusCode !== undefined) {
    return {
      code: err.code,
      message: err.message || defaultMessage,
      statusCode: err.statusCode,
    };
  }

  // Fallback for other errors
  return {
    code: 'SERVICE_ERROR',
    message: err.message || defaultMessage,
    statusCode: 500,
  };
}

/**
 * Send error response
 */
export function sendErrorResponse(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date(),
  });
}
