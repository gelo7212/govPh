import { Request, Response } from 'express';
import { EvacuationCenterService } from './evacuation.service';

export class EvacuationCenterController {
  constructor(private evacuationCenterService: EvacuationCenterService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        cityId: req.query.cityId as string | undefined,
        status: req.query.status as string | undefined,
      };

      const evacuationCenters =
        await this.evacuationCenterService.getAllEvacuationCenters(filters);
      res.json({
        success: true,
        data: evacuationCenters,
        count: evacuationCenters.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const evacuationCenter =
        await this.evacuationCenterService.getEvacuationCenterById(req.params.id);
      if (!evacuationCenter) {
        res.status(404).json({
          success: false,
          error: 'Evacuation center not found',
        });
        return;
      }
      res.json({
        success: true,
        data: evacuationCenter,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getByCity(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        isActive: req.query.isActive === 'true' ? true : undefined,
      };

      const evacuationCenters =
        await this.evacuationCenterService.getEvacuationCentersByCity(
          req.params.cityId,
          filters,
        );
      res.json({
        success: true,
        data: evacuationCenters,
        count: evacuationCenters.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, cityId, location, capacity, facilities, status } = req.body;

      if (!name || !cityId || !location || !capacity || !facilities) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, cityId, location, capacity, facilities',
        });
        return;
      }

      const evacuationCenter =
        await this.evacuationCenterService.createEvacuationCenter(req.body);
      res.status(201).json({
        success: true,
        data: evacuationCenter,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const evacuationCenter =
        await this.evacuationCenterService.updateEvacuationCenter(
          req.params.id,
          req.body,
        );
      if (!evacuationCenter) {
        res.status(404).json({
          success: false,
          error: 'Evacuation center not found',
        });
        return;
      }
      res.json({
        success: true,
        data: evacuationCenter,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const evacuationCenter =
        await this.evacuationCenterService.deleteEvacuationCenter(req.params.id);
      if (!evacuationCenter) {
        res.status(404).json({
          success: false,
          error: 'Evacuation center not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Evacuation center deleted successfully',
        data: evacuationCenter,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;

      if (!status || !['OPEN', 'FULL', 'CLOSED', 'STANDBY'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: OPEN, FULL, CLOSED, STANDBY',
        });
        return;
      }

      const evacuationCenter =
        await this.evacuationCenterService.updateStatus(req.params.id, status);
      if (!evacuationCenter) {
        res.status(404).json({
          success: false,
          error: 'Evacuation center not found',
        });
        return;
      }
      res.json({
        success: true,
        data: evacuationCenter,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateCapacity(req: Request, res: Response): Promise<void> {
    try {
      const { capacity } = req.body;

      if (!capacity) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: capacity',
        });
        return;
      }

      const evacuationCenter =
        await this.evacuationCenterService.updateCapacity(
          req.params.id,
          capacity,
        );
      if (!evacuationCenter) {
        res.status(404).json({
          success: false,
          error: 'Evacuation center not found',
        });
        return;
      }
      res.json({
        success: true,
        data: evacuationCenter,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
