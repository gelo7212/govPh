import { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';

export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = req.headers['x-request-id'] || v4();
  const startTime = Date.now();

  req.context = {
    requestId,
    startTime,
    userId: req.user?.id,
  };

  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}

export default requestContext;
