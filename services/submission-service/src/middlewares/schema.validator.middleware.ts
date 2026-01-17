import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';

/**
 * Validate request body against schema
 */
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'DELETE') {
      // validate query parameters for GET and DELETE requests
      const { error, value } = schema.validate(req.query);
      if (error) { 
        const details: Record<string, string> = {};
        error.details.forEach((err: any) => {
          const path = err.path.join('.');
          details[path] = err.message;
        });
        throw new ValidationError('Request validation failed', details);
      }
      req.query = value;
      return next();
      
    }
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
