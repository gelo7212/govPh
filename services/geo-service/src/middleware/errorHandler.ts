import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, err);

  res.status(statusCode).json({
    success: false,
    message,
    error: err.message,
    statusCode,
  });
};

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    statusCode: 404,
  });
};
