/**
 * Validations Controller
 * Handles form validation endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationsService } from './validations.service';
import { ApiResponse } from '../../types';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ValidationsController');

export class ValidationsController {
  private validationsService: ValidationsService;

  constructor() {
    this.validationsService = new ValidationsService();
  }

  /**
   * POST /api/validations/validate
   * Validate form data against schema
   */
  async validateFormData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { schemaId, data } = req.body;

      logger.debug(`Validating form data for schema: ${schemaId}`);

      const result = await this.validationsService.validateFormData(
        schemaId,
        data
      );

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      } as ApiResponse<any>);
    } catch (error) {
      logger.error('Failed to validate form data', error);
      next(error);
    }
  }
}
