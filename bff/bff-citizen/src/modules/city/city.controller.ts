import { query, Request, Response } from 'express';
import { AdminCityAggregator } from './city.aggregator';
import { handleServiceError, sendErrorResponse } from '@gov-ph/bff-core';

export class CityController {
  private aggregator: AdminCityAggregator;

  constructor(aggregator: AdminCityAggregator) {
    this.aggregator = aggregator;
  }

   async getCityByCode(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.getCityByCode(cityCode);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch city');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getAllCities(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        provinceCode: req.query.provinceCode as string | undefined,
        query: req.query.query as string | undefined,
      };

      const result = await this.aggregator.getAllCities(filters);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch cities');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }


  // ==================== Departments ====================

  async getDepartmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.getDepartmentById(id);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch department');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getDepartmentsByCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const sosCapableOnly = req.query.sosCapable === 'true';
      const result = await this.aggregator.getDepartmentsByCity(cityCode, sosCapableOnly);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch departments');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }


  async getSosHQById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.getSosHQById(id);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch SOS HQ');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getSosHQByCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.getSosHQByCity(cityCode);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch SOS HQ');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
}
