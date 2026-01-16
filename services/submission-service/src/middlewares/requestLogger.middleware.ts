import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('RequestLogger');

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel =
      res.statusCode >= 400 ? 'warn' : res.statusCode >= 500 ? 'error' : 'info';

    logger[logLevel as 'info' | 'warn' | 'error'](
      `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};
