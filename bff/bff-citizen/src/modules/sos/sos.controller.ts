import { Request, Response } from 'express';
import { SosAggregator } from './sos.aggregator';

export class SosController {
  private aggregator: SosAggregator;

  constructor(aggregator: SosAggregator) {
    this.aggregator = aggregator;
  }

  async createSosRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.context?.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const sosData = { ...req.body, userId };
      const result = await this.aggregator.createSosRequest(sosData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
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
      const userId = req.context?.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const requests = await this.aggregator.getUserSosRequests(userId);
      res.json(requests);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async cancelSosRequest(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const result = await this.aggregator.cancelSosRequest(sosId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
