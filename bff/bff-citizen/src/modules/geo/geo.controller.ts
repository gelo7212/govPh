import { Request, Response } from 'express';
import { GeoAggregator } from './geo.aggregator';

export class GeoController {
  private aggregator: GeoAggregator;

  constructor(aggregator: GeoAggregator) {
    this.aggregator = aggregator;
  }

  async getBoundaries(req: Request, res: Response): Promise<void> {
    try {
      const boundaries = await this.aggregator.getBoundaries(req.query);
      res.json(boundaries);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getBoundaryById(req: Request, res: Response): Promise<void> {
    try {
      const { boundaryId } = req.params;
      const boundary = await this.aggregator.getBoundaryById(boundaryId);
      res.json(boundary);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async searchBoundaries(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      if (!query) {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
      }
      const results = await this.aggregator.searchBoundaries(query as string);
      res.json(results);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
