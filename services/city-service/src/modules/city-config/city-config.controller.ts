import { Request, Response } from 'express';
import { CityConfigService } from './city-config.service';

export class CityConfigController {
  constructor(private cityConfigService: CityConfigService) {}

  async getByCity(req: Request, res: Response): Promise<void> {
    try {
      const config = await this.cityConfigService.getCityConfig(
        req.params.cityCode,
      );
      if (!config) {
        res.status(404).json({
          success: false,
          error: 'City config not found',
        });
        return;
      }
      res.json({
        success: true,
        data: config,
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
      };

      const configs = await this.cityConfigService.getAllConfigs(filters);
      res.json({
        success: true,
        data: configs,
        count: configs.length,
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
      const config = await this.cityConfigService.createCityConfig(req.body);
      res.status(201).json({
        success: true,
        data: config,
      });
      return;
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          error: 'City config already exists',
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
      const config = await this.cityConfigService.updateCityConfig(
        req.params.cityCode,
        req.body,
      );
      if (!config) {
        res.status(404).json({
          success: false,
          error: 'City config not found',
        });
        return;
      }
      res.json({
        success: true,
        data: config,
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
      const config = await this.cityConfigService.deleteCityConfig(
        req.params.cityCode,
      );
      if (!config) {
        res.status(404).json({
          success: false,
          error: 'City config not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'City config deleted successfully',
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

  async updateIncidentRules(req: Request, res: Response): Promise<void> {
    try {
      const config = await this.cityConfigService.updateIncidentRules(
        req.params.cityCode,
        req.body,
      );
      if (!config) {
        res.status(404).json({
          success: false,
          error: 'City config not found',
        });
        return;
      }
      res.json({
        success: true,
        data: config,
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

  async updateSosRules(req: Request, res: Response): Promise<void> {
    try {
      const config = await this.cityConfigService.updateSosRules(
        req.params.cityCode,
        req.body,
      );
      if (!config) {
        res.status(404).json({
          success: false,
          error: 'City config not found',
        });
        return;
      }
      res.json({
        success: true,
        data: config,
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

  async updateVisibilityRules(req: Request, res: Response): Promise<void> {
    try {
      const config = await this.cityConfigService.updateVisibilityRules(
        req.params.cityCode,
        req.body,
      );
      if (!config) {
        res.status(404).json({
          success: false,
          error: 'City config not found',
        });
        return;
      }
      res.json({
        success: true,
        data: config,
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

  async initializeSetup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || 'SYSTEM';
      const config = await this.cityConfigService.initializeSetup(
        req.params.cityCode,
        userId,
      );
      if (!config) {
        res.status(404).json({
          success: false,
          error: 'City config not found',
        });
        return;
      }
      res.json({
        success: true,
        data: config,
        message: 'Setup initialized successfully',
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

  async updateSetupStep(req: Request, res: Response): Promise<void> {
    try {
      const { step } = req.body;
      if (
        ![
          'CITY_PROFILE',
          'DEPARTMENTS',
          'SOS_HQ',
          'SETTINGS',
          'COMPLETED',
        ].includes(step)
      ) {
        res.status(400).json({
          success: false,
          error: 'Invalid setup step',
        });
        return;
      }
      const config = await this.cityConfigService.updateSetupStep(
        req.params.cityCode,
        step,
      );
      if (!config) {
        res.status(404).json({
          success: false,
          error: 'City config not found',
        });
        return;
      }
      res.json({
        success: true,
        data: config,
        message: `Setup step updated to ${step}`,
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

  async getSetupStatus(req: Request, res: Response): Promise<void> {
    try {
      const setup = await this.cityConfigService.getSetupStatus(
        req.params.cityCode,
      );
      if (!setup) {
        res.status(404).json({
          success: false,
          error: 'City config not found',
        });
        return;
      }
      res.json({
        success: true,
        data: setup,
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
