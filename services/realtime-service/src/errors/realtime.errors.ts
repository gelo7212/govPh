export class RealtimeError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'RealtimeError';
  }
}

export const REALTIME_ERRORS = {
  INVALID_TOKEN: new RealtimeError(
    'INVALID_TOKEN',
    401,
    'Invalid or missing authentication token',
  ),
  UNAUTHORIZED: new RealtimeError(
    'UNAUTHORIZED',
    403,
    'Unauthorized access',
  ),
  SOS_NOT_FOUND: new RealtimeError(
    'SOS_NOT_FOUND',
    404,
    'SOS request not found',
  ),
  REDIS_ERROR: new RealtimeError(
    'REDIS_ERROR',
    500,
    'Redis connection error',
  ),
  SOCKET_ERROR: new RealtimeError(
    'SOCKET_ERROR',
    500,
    'Socket.IO error',
  ),
  INTERNAL_ERROR: new RealtimeError(
    'INTERNAL_ERROR',
    500,
    'Internal server error',
  ),
};

export default REALTIME_ERRORS;
