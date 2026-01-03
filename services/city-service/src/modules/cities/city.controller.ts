import { Request, Response } from 'express';
import { CityService } from './city.service';

export class CityController {
  constructor(private cityService: CityService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        provinceCode: req.query.provinceCode as string | undefined,
      };

      const cities = await this.cityService.getAllCities(filters);
      res.json({
        success: true,
        data: cities,
        count: cities.length,
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

  async getByCode(req: Request, res: Response): Promise<void> {
    try {
      const city = await this.cityService.getCityByCode(req.params.cityCode);
      if (!city) {
        res.status(404).json({
          success: false,
          error: 'City not found',
        });
        return;
      }
      res.json({
        success: true,
        data: city,
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
      const city = await this.cityService.createCity(req.body);
      res.status(201).json({
        success: true,
        data: city,
      });
      return;
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          error: 'City code already exists',
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
      const city = await this.cityService.updateCity(
        req.params.cityCode,
        req.body,
      );
      if (!city) {
        res.status(404).json({
          success: false,
          error: 'City not found',
        });
        return;
      }
      res.json({
        success: true,
        data: city,
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
      const city = await this.cityService.deleteCity(req.params.cityCode);
      if (!city) {
        res.status(404).json({
          success: false,
          error: 'City not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'City deleted successfully',
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

  async getByProvince(req: Request, res: Response): Promise<void> {
    try {
      const cities = await this.cityService.getCitiesByProvince(
        req.params.provinceCode,
      );
      res.json({
        success: true,
        data: cities,
        count: cities.length,
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
