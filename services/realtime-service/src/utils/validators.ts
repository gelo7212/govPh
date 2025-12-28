import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from './logger';

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const messages = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        logger.warn('Validation error', { messages });

        res.status(400).json({
          success: false,
          errors: messages,
        });
        return;
      }

      req.body = value;
      next();
    } catch (err) {
      logger.error('Validation middleware error', err);
      res.status(500).json({
        success: false,
        error: 'Validation error',
      });
    }
  };
};

export default validate;
