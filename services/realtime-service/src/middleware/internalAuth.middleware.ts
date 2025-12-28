import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { REALTIME_ERRORS } from '../errors/realtime.errors';
import { logger } from '../utils/logger';
import { HTTP_HEADERS } from '../utils/constants';

/**
 * Middleware for validating internal service-to-service authentication
 * Uses X-Internal-Token header
 */
export const internalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers[HTTP_HEADERS.INTERNAL_AUTH] as string;

  if (!token || token !== config.INTERNAL_AUTH_TOKEN) {
    logger.warn('Invalid internal auth token attempt', {
      path: req.path,
      ip: req.ip,
    });
    res.status(401).json({
      error: REALTIME_ERRORS.INVALID_TOKEN.code,
      message: REALTIME_ERRORS.INVALID_TOKEN.message,
    });
    return;
  }

  next();
};

export default internalAuthMiddleware;
