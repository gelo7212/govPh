import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';

/**
 * Validate request body against schema
 */
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      const details: Record<string, string> = {};
      error.details.forEach((err: any) => {
        const path = err.path.join('.');
        details[path] = err.message;
      });

      throw new ValidationError('Request validation failed', details);
    }

    req.body = value;
    next();
  };
};
