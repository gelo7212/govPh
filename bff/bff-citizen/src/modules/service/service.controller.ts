import { Request, Response } from 'express';
import { AdminServiceAggregator } from './service.aggregator';
import { handleServiceError, sendErrorResponse } from '@gov-ph/bff-core';

export class ServiceController {
  private aggregator: AdminServiceAggregator;

  constructor(aggregator: AdminServiceAggregator) {
    this.aggregator = aggregator;
  }

  // ==================== Service Operations ====================

  /**
   * Get service by ID
   */
  async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const result = await this.aggregator.getServiceById(serviceId);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch service');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * Get all services for a city
   */
  async getServicesByCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityId } = req.params;
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        category: req.query.category as string | undefined,
      };
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const result = await this.aggregator.getServicesByCity(cityId, filters, limit, skip);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch services');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }


  /**
   * Get services by category
   */
  async getServicesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { cityId, category } = req.params;
      const isActive = req.query.isActive === 'true' ? true : undefined;

      const result = await this.aggregator.getServicesByCategory(cityId, category, isActive);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch services');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
}
