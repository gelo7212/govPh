import { Request, Response } from 'express';
import { SosAggregator } from './sos.aggregator';

export class SosController {
  private aggregator: SosAggregator;

  constructor(aggregator: SosAggregator) {
    this.aggregator = aggregator;
  }

  async getSosRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.context?.user;
      const isAnon = user?.actor?.type === 'ANON';
      if(isAnon){
        const anonSosId = user?.sosAnonSosId;
        if(!anonSosId || anonSosId !== req.params.sosId){
          res.status(403).json({ error: 'FORBIDDEN: ANON actor can only access their own SOS request' });
          return;
        }
      }
      
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
  async getSosState(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const state = await this.aggregator.getSosState(sosId);
      res.status(200).json({
        success: true,
        data: state.data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve SOS state',
      });
    }
  }

  async createAnonRescuer(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { requestMissionId, cityCode } = req.body;
      const userContext = {
        userId: req.context?.user?.id,
        actorType: req.context?.user?.actor?.type,
        role: req.context?.user?.role,
        cityId: req.context?.user?.actor?.cityCode
      };
      const token = await this.aggregator.createAnonRescuer(sosId, requestMissionId, cityCode, userContext);
      if(!token){
        throw new Error('Failed to create anonymous rescuer identity');
      }

      res.status(201).json({ success: true , data: {token: token}, message: 'Anonymous Rescuer Identity created successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    } 
  }
  async dispatchRescue(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { rescuerId } = req.body;
      const sosData = {
        sosId,
        rescuerId
      };

      const userContext = {
        userId: req.context?.user?.id,
        actorType: req.context?.user?.actor?.type,
        role: req.context?.user?.role,
        cityId: req.context?.user?.actor?.cityCode
      };
      const result = await this.aggregator.dispatchRescue(sosData, userContext);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
  async updateRescuerLocation(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng } = req.body;
      const location = {
        latitude: lat,
        longitude: lng
      };
      const userContext = {
        userId: req.context?.user?.id,
        actorType: req.context?.user?.actor?.type,
        role: req.context?.user?.role,
        cityId: req.context?.user?.actor?.cityCode
      };
      const result = await this.aggregator.updateRescuerLocation(location, userContext);
      res.status(201).json(result);
    }
    catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getRescuerAssignment(req: Request, res: Response): Promise<void> {
    try {
      const userContext = {
        userId: req.context?.user?.id,
        actorType: req.context?.user?.actor?.type,
        role: req.context?.user?.role,
        cityId: req.context?.user?.actor?.cityCode
      };
      const result = await this.aggregator.getRescuerAssignment(userContext);
      res.status(200).json(result);
    }
    catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}