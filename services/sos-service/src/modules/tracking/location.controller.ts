import { Request, Response } from 'express';
import { LocationService } from './location.service';

export class LocationController {
  constructor(private locationService: LocationService) {}

  async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const result = await this.locationService.updateLocation(data);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getLocationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sosId, cityId } = req.params;
      const history = await this.locationService.getLocationHistory(sosId, cityId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
