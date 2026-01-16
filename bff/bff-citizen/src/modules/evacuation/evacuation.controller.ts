import { Request, Response } from 'express';
import { AdminEvacuationCenterAggregator } from './evacuation.aggregator';
import { handleServiceError, sendErrorResponse } from '@gov-ph/bff-core';

export class EvacuationCenterController {
  private aggregator: AdminEvacuationCenterAggregator;

  constructor(aggregator: AdminEvacuationCenterAggregator) {
    this.aggregator = aggregator;
  }

  async getAllEvacuationCenters(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        cityId: req.query.cityId as string | undefined,
        status: req.query.status as string | undefined,
        isActive: req.query.isActive === 'true' ? true : undefined,
      };

      const result = await this.aggregator.getAllEvacuationCenters(filters);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch evacuation centers');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getEvacuationCenterById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.getEvacuationCenterById(id);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch evacuation center');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getEvacuationCentersByCity(req: Request, res: Response): Promise<void> {
    try {
      const cityId = req.query.cityId as string | undefined;

      if (!cityId) {
        sendErrorResponse(res, 400, 'VALIDATION_ERROR', 'cityId query parameter is required');
        return;
      }

      const filters = {
        status: req.query.status as string | undefined,
        isActive: req.query.isActive === 'true' ? true : undefined,
      };

      const result = await this.aggregator.getEvacuationCentersByCity(cityId, filters);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch evacuation centers for city');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }


  async getOpenEvacuationCentersByCity(req: Request, res: Response): Promise<void> {
    try {
      const cityId = req.query.cityId as string | undefined;

      if (!cityId) {
        sendErrorResponse(res, 400, 'VALIDATION_ERROR', 'cityId query parameter is required');
        return;
      }

      const result = await this.aggregator.getOpenEvacuationCentersByCity(cityId);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch open evacuation centers');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getAvailableEvacuationCentersByCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityId } = req.params;
      const result = await this.aggregator.getAvailableEvacuationCentersByCity(cityId);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch available evacuation centers');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getAvailableCapacity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.getAvailableCapacity(id);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch available capacity');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
}
