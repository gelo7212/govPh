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

  async createEvacuationCenter(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.aggregator.createEvacuationCenter(req.body);
      res.status(201).json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to create evacuation center');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async updateEvacuationCenter(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.updateEvacuationCenter(id, req.body);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update evacuation center');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async deleteEvacuationCenter(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.deleteEvacuationCenter(id);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to delete evacuation center');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async updateEvacuationCenterStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        sendErrorResponse(res, 400, 'VALIDATION_ERROR', 'Status is required');
        return;
      }

      const result = await this.aggregator.updateEvacuationCenterStatus(id, status);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update evacuation center status');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async updateEvacuationCenterCapacity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { capacity } = req.body;

      if (!capacity) {
        sendErrorResponse(res, 400, 'VALIDATION_ERROR', 'Capacity is required');
        return;
      }

      const result = await this.aggregator.updateEvacuationCenterCapacity(id, { capacity });
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update evacuation center capacity');
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
