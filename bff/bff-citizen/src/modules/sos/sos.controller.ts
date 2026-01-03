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
      const actor = req.context?.user?.actor?.type;
      if(actor !== "ANON"){
        if (!userId ) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
      }
      const location = req.body.location;
      const address = req.body.address;
      const deviceId = req.headers['x-device-id'] || null;
      if(!deviceId){
        throw new Error('Device ID is required');
      }
      // optional location
      
      const sosData = { 
        ...req.body, 
        userId,
        userRole: req.context?.user?.role, 
        location, 
        address, 
        deviceId , 
        actorType : req.context?.user?.actor?.type, 
        cityId: req.context?.user?.actor?.cityCode
      };
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
      const requests = await this.aggregator.getAllSosRequests({ userId });
      res.json(requests);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getActiveSosByCitizen(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.context?.user?.id;
      const cityCode = req.context?.user?.actor?.cityCode;
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


  async cancelSosRequest(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const userContext = {
        userId: req.context?.user?.id,
        actorType: req.context?.user?.actor?.type,
        role: req.context?.user?.role,
        cityId: req.context?.user?.actor?.cityCode
      };
      const result = await this.aggregator.cancelSosRequest(sosId, userContext);
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
}