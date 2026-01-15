import { createLogger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
const logger = createLogger('App');

export const loggerMiddleware = (route: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        logger.info(`Incoming request to ${route}`, {
            method: req.method,
            path: req.path,
            headers: req.headers,
            body: req.body,
        });
    next();
  };
};
