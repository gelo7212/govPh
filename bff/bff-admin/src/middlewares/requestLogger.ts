import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Log incoming request
  console.log(`[${requestId}] ${req.method} ${req.path} - Client: ${req.ip}`);

  // Capture response
  const originalJson = res.json;
  res.json = function (data: any) {
    const duration = Date.now() - startTime;
    console.log(
      `[${requestId}] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`
    );
    return originalJson.call(this, data);
  };

  next();
};