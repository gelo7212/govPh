import { Request, Response } from 'express';
import { ServiceService } from './service.service';

export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const service = await this.serviceService.getServiceById(req.params.serviceId);
      if (!service) {
        res.status(404).json({
          success: false,
          error: 'Service not found',
        });
        return;
      }
      res.json({
        success: true,
        data: service,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async getByCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityId } = req.params;
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        category: req.query.category as string | undefined,
      };

      const services = await this.serviceService.getServicesByCity(cityId, filters);
      res.json({
        success: true,
        data: services,
        count: services.length,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        category: req.query.category as string | undefined,
        cityId: req.query.cityId as string | undefined,
      };

      const services = await this.serviceService.getAllServices(filters);
      res.json({
        success: true,
        data: services,
        count: services.length,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { cityId, code, title, shortDescription, category, icon, infoForm, applicationForm, availability } = req.body;

      if (!cityId || !code || !title || !shortDescription || !category) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: cityId, code, title, shortDescription, category',
        });
        return;
      }

      const service = await this.serviceService.createService({
        cityId,
        code,
        title,
        shortDescription,
        category,
        icon,
        isActive: true,
        infoForm,
        applicationForm,
        availability,
      });

      res.status(201).json({
        success: true,
        data: service,
      });
      return;
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          error: 'Service with this code already exists in this city',
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const service = await this.serviceService.updateService(
        req.params.serviceId,
        req.body,
      );
      if (!service) {
        res.status(404).json({
          success: false,
          error: 'Service not found',
        });
        return;
      }
      res.json({
        success: true,
        data: service,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const service = await this.serviceService.deleteService(req.params.serviceId);
      if (!service) {
        res.status(404).json({
          success: false,
          error: 'Service not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Service deleted successfully',
        data: service,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async archive(req: Request, res: Response): Promise<void> {
    try {
      const service = await this.serviceService.archiveService(req.params.serviceId);
      if (!service) {
        res.status(404).json({
          success: false,
          error: 'Service not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Service archived successfully',
        data: service,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async activate(req: Request, res: Response): Promise<void> {
    try {
      const service = await this.serviceService.activateService(req.params.serviceId);
      if (!service) {
        res.status(404).json({
          success: false,
          error: 'Service not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Service activated successfully',
        data: service,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async updateInfoForm(req: Request, res: Response): Promise<void> {
    try {
      const { formId, version } = req.body;
      if (!formId) {
        res.status(400).json({
          success: false,
          error: 'formId is required',
        });
        return;
      }

      const service = await this.serviceService.updateServiceForm(
        req.params.serviceId,
        'infoForm',
        { formId, version },
      );

      if (!service) {
        res.status(404).json({
          success: false,
          error: 'Service not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Info form updated successfully',
        data: service,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async updateApplicationForm(req: Request, res: Response): Promise<void> {
    try {
      const { formId, version } = req.body;
      if (!formId) {
        res.status(400).json({
          success: false,
          error: 'formId is required',
        });
        return;
      }

      const service = await this.serviceService.updateServiceForm(
        req.params.serviceId,
        'applicationForm',
        { formId, version },
      );

      if (!service) {
        res.status(404).json({
          success: false,
          error: 'Service not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Application form updated successfully',
        data: service,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { startAt, endAt } = req.body;

      const service = await this.serviceService.updateServiceAvailability(
        req.params.serviceId,
        { startAt, endAt },
      );

      if (!service) {
        res.status(404).json({
          success: false,
          error: 'Service not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Availability updated successfully',
        data: service,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }
}
