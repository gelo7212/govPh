export interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  statusCode: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorHandler = (
  err: Error | ApiError,
  statusCode: number = 500
): ErrorResponse => {
  if (err instanceof ApiError) {
    return {
      success: false,
      message: err.message,
      error: err.error || err.message,
      statusCode: err.statusCode,
    };
  }

  return {
    success: false,
    message: 'Internal Server Error',
    error: err.message,
    statusCode,
  };
};
