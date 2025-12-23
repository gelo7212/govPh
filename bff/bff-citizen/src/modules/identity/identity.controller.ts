import { Request, Response } from 'express';
import { IdentityAggregator } from './identity.aggregator';

export class IdentityController {
  private aggregator: IdentityAggregator;

  constructor(aggregator: IdentityAggregator) {
    this.aggregator = aggregator;
  }

  async getToken(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.aggregator.getToken(email);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.context?.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const profile = await this.aggregator.getProfile(userId);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Invalidate token logic
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
