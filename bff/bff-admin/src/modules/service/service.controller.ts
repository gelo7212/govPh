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
   * Create a new service
   */
  async createService(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.aggregator.createService(req.body);
      res.status(201).json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to create service');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

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
   * Get all services globally
   */
  async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        category: req.query.category as string | undefined,
        cityId: req.query.cityId as string | undefined,
      };
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const result = await this.aggregator.getAllServices(filters, limit, skip);
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

  /**
   * Update service
   */
  async updateService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const result = await this.aggregator.updateService(serviceId, req.body);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update service');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * Archive service
   */
  async archiveService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const result = await this.aggregator.archiveService(serviceId);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to archive service');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * Activate service
   */
  async activateService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const result = await this.aggregator.activateService(serviceId);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to activate service');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * Delete service
   */
  async deleteService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const result = await this.aggregator.deleteService(serviceId);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to delete service');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * Update info form
   */
  async updateInfoForm(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const { formId, version } = req.body;

      if (!formId) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'formId is required');
        return;
      }

      const result = await this.aggregator.updateInfoForm(serviceId, formId, version);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update info form');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * Update application form
   */
  async updateApplicationForm(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const { formId, version } = req.body;

      if (!formId) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'formId is required');
        return;
      }

      const result = await this.aggregator.updateApplicationForm(serviceId, formId, version);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update application form');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * Update availability
   */
  async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const { startAt, endAt } = req.body;

      const result = await this.aggregator.updateAvailability(serviceId, startAt, endAt);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update availability');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * Get count of services in a city
   */
  async countServicesByCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityId } = req.params;
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
      };

      const result = await this.aggregator.countServicesByCity(cityId, filters);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to count services');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
}
