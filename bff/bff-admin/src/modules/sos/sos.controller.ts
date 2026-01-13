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

      const resolutionNote = req.body.resolutionNote;
      const status = req.body.status;
      const result = await this.aggregator.closeSosRequest(sosId, userContext, resolutionNote, status);
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

      res.status(201).json({ success: true , data: {token: token?.data}, message: 'Anonymous Rescuer Identity created successfully' });
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
      const { lat, lng, sosId, accuracy } = req.body;
      const rescuerId  =req.context?.user?.id;

      if(!rescuerId){
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const result = await this.aggregator.updateRescuerLocation(
        sosId,
        rescuerId,
        lat,
        lng,
        accuracy
      );
      res.status(201).json(result);
    }
    catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getRescuerLocation(req: Request, res: Response): Promise<void> {
    try {
      
      const { rescuerId, sosId }  = req.query;
      if(!rescuerId){
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const result = await this.aggregator.getRescuerLocation(
        sosId as string,
        rescuerId as string
      );
      res.status(200).json(result);
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

  /**
   * List all SOS requests with optional filters, search, and sort
   * cityId is REQUIRED (AND condition)
   * Query Parameters:
   *   - filter[date][startDate]: ISO date string
   *   - filter[date][endDate]: ISO date string
   *   - filter[type]: comma-separated types
   *   - filter[status]: comma-separated statuses
   *   - filter[soNo]: SOS number
   *   - filter[citizenId]: Citizen ID
   *   - search: search term (searches in type, message, soNo, citizenId, id)
   *   - sort: field name (createdAt|type|status)
   *   - sortOrder: asc|desc
   */
  async listSOS(req: Request, res: Response): Promise<void> {
    try {
      // cityId is REQUIRED - comes from authenticated user context
      const cityId = req.context?.user?.actor?.cityCode;
      if (!cityId) {
        res.status(401).json({ 
          success: false,
          error: 'Unauthorized - cityId required' 
        });
        return;
      }

       const context = {
        userId: req.context?.user?.id,
        actorType: req.context?.user?.actor?.type,
        role: req.context?.user?.role,
        cityId: req.context?.user?.actor?.cityCode
      };

      const { search, sort, sortOrder, sosHqID } = req.query;
      if(!sosHqID || typeof sosHqID !== 'string'){
        res.status(400).json({ 
          success: false,
          error: 'sosHqID query parameter is required' 
        });
        return;
      }

      // Parse filters from query parameters
      const filters: any = {};

      console.log('[listSOS] Raw req.query:', JSON.stringify(req.query, null, 2));
      
      // Express parses bracket notation into nested objects
      // filter[date][startDate] → filter.date.startDate
      const filterObj = (req.query.filter as any) || {};
      
      // Parse date filters
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      // Handle both nested object and flat key formats
      if (typeof filterObj === 'object' && filterObj !== null) {
        if (filterObj.date && typeof filterObj.date === 'object') {
          startDate = filterObj.date.startDate;
          endDate = filterObj.date.endDate;
        }
      }
      
      console.log('[listSOS] Date filters - startDate:', startDate, 'endDate:', endDate);
      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.startDate = startDate;
        if (endDate) filters.date.endDate = endDate;
      }

      // Parse type filters (comma-separated)
      let typeFilter: string | undefined;
      if (filterObj.type) {
        typeFilter = Array.isArray(filterObj.type) ? filterObj.type[0] : filterObj.type;
      }
      console.log('[listSOS] Type filter raw:', typeFilter);
      if (typeFilter) {
        filters.type = typeFilter.split(',').map(t => t.trim());
      }

      // Parse status filters (comma-separated)
      let statusFilter: string | undefined;
      if (filterObj.status) {
        statusFilter = Array.isArray(filterObj.status) ? filterObj.status[0] : filterObj.status;
      }
      console.log('[listSOS] Status filter raw:', statusFilter);
      if (statusFilter) {
        filters.status = statusFilter.split(',').map(s => s.trim());
      }

      // Parse soNo filter
      let soNoFilter: string | undefined;
      if (filterObj.soNo) {
        soNoFilter = Array.isArray(filterObj.soNo) ? filterObj.soNo[0] : filterObj.soNo;
      }
      console.log('[listSOS] SoNo filter:', soNoFilter);
      if (soNoFilter) {
        filters.soNo = soNoFilter;
      }

      // Parse citizenId filter
      let citizenIdFilter: string | undefined;
      if (filterObj.citizenId) {
        citizenIdFilter = Array.isArray(filterObj.citizenId) ? filterObj.citizenId[0] : filterObj.citizenId;
      }
      console.log('[listSOS] CitizenId filter:', citizenIdFilter);
      if (citizenIdFilter) {
        filters.citizenId = citizenIdFilter;
      }

      console.log('[listSOS] Parsed filters object:', JSON.stringify(filters, null, 2));

      // Build options object with cityId as required AND condition
      const options: any = {
        cityId // REQUIRED - AND condition
      };
      if (Object.keys(filters).length > 0) {
        options.filters = filters;
      }
      if (search) {
        options.search = search as string;
      }
      if (sort && (sort === 'createdAt' || sort === 'type' || sort === 'status')) {
        options.sort = {
          field: sort as 'createdAt' | 'type' | 'status',
          order: (sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
        };
      }
      if(sosHqID && typeof sosHqID === 'string'){
        options.sosHqID = sosHqID;
      }

      console.log("QUERY OPTIONS:", JSON.stringify(options, null, 2));

      const results = await this.aggregator.getAllSosRequests(options, context);

      res.status(200).json({
        success: true,
        data: results.data,
        timestamp: new Date(),
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: (error as Error).message 
      });
    }
  }
  async getRescuerListByCity(req: Request, res: Response): Promise<void> {
    try {
      const { municipalityCode } = req.params;
      const context = {
        userId: req.context?.user?.id,
        actorType: req.context?.user?.actor?.type,
        role: req.context?.user?.role,
        cityId: req.context?.user?.actor?.cityCode
      };
      const rescuers = await this.aggregator.getRescuerListByCity(municipalityCode, context);
      res.status(200).json({ success: true, data: rescuers });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}