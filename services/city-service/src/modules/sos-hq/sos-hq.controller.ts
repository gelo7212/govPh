import { Request, Response } from 'express';
import { SosHQService } from './sos-hq.service';

export class SosHQController {
  constructor(private sosHQService: SosHQService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        cityCode: req.query.cityCode as string | undefined,
        provinceCode: req.query.provinceCode as string | undefined,
        scopeLevel: req.query.scopeLevel as 'CITY' | 'PROVINCE' | undefined,
      };

      const sosHQ = await this.sosHQService.getAllSosHQ(filters);
      res.json({
        success: true,
        data: sosHQ,
        count: sosHQ.length,
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const sosHQ = await this.sosHQService.getSosHQById(req.params.id);
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'SOS HQ not found',
        });
        return;
      }
      res.json({
        success: true,
        data: sosHQ,
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

  async getByCity(req: Request, res: Response) : Promise<void> {
    try {
      const sosHQ = await this.sosHQService.getSosHQByCity(
        req.params.cityCode,
      );
      res.json({
        success: true,
        data: sosHQ,
        count: sosHQ.length,
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

  async getByProvince(req: Request, res: Response) : Promise<void> {
    try {
      const sosHQ = await this.sosHQService.getSosHQByProvince(
        req.params.provinceCode,
      );
      res.json({
        success: true,
        data: sosHQ,
        count: sosHQ.length,
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

  async create(req: Request, res: Response) : Promise<void> {
    try {
      const sosHQ = await this.sosHQService.createSosHQ(req.body);
      res.status(201).json({
        success: true,
        data: sosHQ,
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

  async update(req: Request, res: Response) : Promise<void> {
    try {
      const sosHQ = await this.sosHQService.updateSosHQ(
        req.params.id,
        req.body,
      );
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'SOS HQ not found',
        });
        return;
      }
      res.json({
        success: true,
        data: sosHQ,
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
      const sosHQ = await this.sosHQService.deleteSosHQ(req.params.id);
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'SOS HQ not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'SOS HQ deleted successfully',
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
      const sosHQ = await this.sosHQService.activateSosHQ(req.params.id);
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'SOS HQ not found',
        });
        return;
      }
      res.json({
        success: true,
        data: sosHQ,
        message: 'SOS HQ activated successfully',
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

  async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const sosHQ = await this.sosHQService.deactivateSosHQ(req.params.id);
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'SOS HQ not found',
        });
        return;
      }
      res.json({
        success: true,
        data: sosHQ,
        message: 'SOS HQ deactivated successfully',
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
