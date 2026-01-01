import { Request, Response } from 'express';
import { SosAggregator } from './sos.aggregator';

export class SosController {
  private aggregator: SosAggregator;

  constructor(aggregator: SosAggregator) {
    this.aggregator = aggregator;
  }

  async getSosRequest(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const result = await this.aggregator.getSosRequest(sosId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUserSosRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const requests = await this.aggregator.getAllSosRequests({ userId });
      res.json(requests);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getActiveSosByCitizen(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId;
      const cityCode = req.body.cityCode;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const result = await this.aggregator.getActiveSosByCitizen(userId, cityCode || '');
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }


  async closeSosRequest(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const userContext = {
        userId: req.context?.user?.id,
        actorType: req.context?.user?.actor?.type,
        role: req.context?.user?.role,
        cityId: req.context?.user?.actor?.cityCode
      };
      const result = await this.aggregator.closeSosRequest(sosId, userContext);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateSosTag(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { tag } = req.body;
      const result = await this.aggregator.updateSosTag(sosId, tag);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getNearbySOSStates(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, radius } = req.query;
      if (!latitude || !longitude || !radius) {
        res.status(400).json({
          success: false,
          error: 'latitude, longitude, and radius are required query parameters',
        });
        return;
      }
      const states = await this.aggregator.getNearbySOSStates(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseInt(radius as string)
      );
      res.status(200).json({
        success: true,
        data: states.data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve nearby SOS states',
      });
    }
  }
}