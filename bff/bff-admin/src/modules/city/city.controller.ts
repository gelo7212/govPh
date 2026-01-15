import { Request, Response } from 'express';
import { AdminCityAggregator } from './city.aggregator';
import { handleServiceError, sendErrorResponse } from '@gov-ph/bff-core';

export class CityController {
  private aggregator: AdminCityAggregator;

  constructor(aggregator: AdminCityAggregator) {
    this.aggregator = aggregator;
  }

  // ==================== Cities ====================

  async getAllCities(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        provinceCode: req.query.provinceCode as string | undefined,
      };

      const result = await this.aggregator.getAllCities(filters);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch cities');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
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

  async createCity(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.aggregator.createCity(req.body);
      res.status(201).json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to create city');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async updateCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.updateCity(cityCode, req.body);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update city');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async deleteCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.deleteCity(cityCode);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to delete city');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  // ==================== Departments ====================

  async getAllDepartments(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        cityCode: req.query.cityCode as string | undefined,
      };

      const result = await this.aggregator.getAllDepartments(filters);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch departments');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

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

  async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.aggregator.createDepartment(req.body);
      res.status(201).json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to create department');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async updateDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.updateDepartment(id, req.body);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update department');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async deleteDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.deleteDepartment(id);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to delete department');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  // ==================== SOS HQ ====================

  async getAllSosHQ(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        cityCode: req.query.cityCode as string | undefined,
        provinceCode: req.query.provinceCode as string | undefined,
        scopeLevel: req.query.scopeLevel as 'CITY' | 'PROVINCE' | undefined,
      };

      const result = await this.aggregator.getAllSosHQ(filters);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch SOS HQ');
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

  async createSosHQ(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.aggregator.createSosHQ(req.body);
      res.status(201).json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to create SOS HQ');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getSosHQByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const result = await this.aggregator.getSosHQByUserId(userId);
      res.json(result);
    }
    catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch SOS HQ by user ID');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
  async updateSosHQ(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.updateSosHQ(id, req.body);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update SOS HQ');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async deleteSosHQ(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.deleteSosHQ(id);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to delete SOS HQ');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async activateSosHQ(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.activateSosHQ(id);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to activate SOS HQ');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async deactivateSosHQ(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.deactivateSosHQ(id);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to deactivate SOS HQ');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  // ==================== City Config ====================

  async getAllCityConfigs(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
      };

      const result = await this.aggregator.getAllCityConfigs(filters);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch city configs');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getCityConfig(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.getCityConfig(cityCode);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch city config');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async createCityConfig(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.aggregator.createCityConfig(req.body);
      res.status(201).json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to create city config');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async updateCityConfig(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.updateCityConfig(cityCode, req.body);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update city config');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async deleteCityConfig(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.deleteCityConfig(cityCode);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to delete city config');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  // ==================== Config Rules ====================

  async updateIncidentRules(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.updateIncidentRules(cityCode, req.body);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update incident rules');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async updateSosRules(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.updateSosRules(cityCode, req.body);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update SOS rules');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async updateVisibilityRules(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.updateVisibilityRules(cityCode, req.body);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update visibility rules');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  // ==================== Setup Workflow ====================

  async initializeSetup(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const { userId } = req.body;
      const result = await this.aggregator.initializeSetup(cityCode, userId);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to initialize setup');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async updateSetupStep(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const { step } = req.body;
      const result = await this.aggregator.updateSetupStep(cityCode, step);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update setup step');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getSetupStatus(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.getSetupStatus(cityCode);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch setup status');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  // ==================== Composite Operations ====================

  async getCompleteCitySetup(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const result = await this.aggregator.getCompleteCitySetup(cityCode);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch complete city setup');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
}
