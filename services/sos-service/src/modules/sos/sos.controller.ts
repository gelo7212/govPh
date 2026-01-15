import { Request, Response } from 'express';
import { SOSService } from './sos.service';
import { StatusMachineService } from './statusMachine.service';
import { UserRole } from '../../middleware/roleGuard';
import { ForbiddenError, NotFoundError, ValidationError } from '../../errors';
import { createLogger } from '../../utils/logger';
import { CounterService } from '../counter';
import { CityClient } from '../../services/city.client';

const logger = createLogger('SOSController');

export class SOSController {
  private cityClient = new CityClient();
  constructor(
    private sosService: SOSService, 
    private statusMachine: StatusMachineService,
    private counterService: CounterService
  ) {}

  /**
   * POST /sos
   * Create SOS (CITIZEN only)
   */
  async createSOS(req: Request, res: Response): Promise<void> {
    try {
      const isAnon = req.user?.actor?.type === "ANON";

      if(!isAnon){
        if (!req.user || req.user.role !== UserRole.CITIZEN) {
          throw new ForbiddenError('Only citizens can create SOS requests');
        }
      }

      const deviceId = req.headers['x-device-id'] as string;
      if( !deviceId ) {
        throw new ValidationError('Missing deviceId in headers');
      }

      const { type, message, silent, address } = req.body;
      const { id: citizenId, cityId } = req.user || { id: '', cityId: '' };
      let name  = 'Anonymous Citizen';

      const location = req.body.location;
      const barangay = address?.barangay || '';
      const city = address?.city || '';
      if(!isAnon){
        if (!citizenId || !cityId) {
          throw new ValidationError('Missing citizenId or cityId');
        }
        const existingSOS = await this.sosService.getActiveSOSByCitizen(citizenId);
        if (existingSOS) {
          throw new ValidationError('An active SOS request already exists for this citizen');
        }

    }


      const sos = await this.sosService.createSOS({
        type,
        message,
        citizenId,
        cityId : undefined,
        latitude: location?.latitude || 0, // Will be updated with first location
        longitude: location?.longitude || 0,
        address: { city, barangay },
        sosNo: await this.counterService.generateSOSNumber(),
        deviceId
      });

      res.status(201).json({
        success: true,
        data: {
          id: sos.id,
          userId: sos.citizenId,
          status: sos.status,
          location: sos.lastKnownLocation,
          description: sos.message,
          type: sos.type,
          createdAt: sos.createdAt,
          updatedAt: sos.updatedAt,
          sosNo: sos.soNo,
          message: sos.message,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error creating SOS', { error });
      throw error;
    }
  }

  async getActiveSOSByCitizen(req: Request, res: Response): Promise<void> {
    
    const { citizenId } = req.query as { citizenId?: string };
    if( !citizenId ) {
      throw new ValidationError('Missing citizenId parameter');
    }

    const sos = await this.sosService.getActiveSOSByCitizen(citizenId);
    res.status(200).json({
      success: true,
      data: sos,
      timestamp: new Date(),
    });
  }

  /**
   * GET /sos/{sosId}
   * Get SOS Details
   */
  async getSOS(req: Request, res: Response): Promise<void> {

    const { sosId } = req.params;
    const result = await this.sosService.getSOS(sosId);
    if (!result) {
      throw new NotFoundError('SOS request', sosId);
    }

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  }

  async listSosByCitizen(citizenId: string): Promise<any[]> {
    const results = await this.sosService.listByCitizen(citizenId);
    return results;
  }

  /**
   * GET /sos
   * List Active SOS with optional filters, search, and sort
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

    if(req.user && req.user.role === UserRole.CITIZEN && req.user.id ) {
       const results = await this.sosService.listByCitizen(req.user.id);
        res.status(200).json({
          success: true,
          data: results,
          timestamp: new Date(),
        });
        return;
    }

    if (!req.user || req.user.role !== UserRole.APP_ADMIN && req.user.role !== UserRole.CITY_ADMIN && req.user.role !== UserRole.SOS_ADMIN) {
      throw new ForbiddenError('Only admins can list SOS requests');
    }
    
    const { search, sort, sortOrder, cityId, filter, sosHqID } = req.query;
    if(!sosHqID){
      throw new ValidationError('Missing sosHqID parameter');
    }

    const SosHQ = await this.cityClient.getHQById(sosHqID as string);
    
    const hqLocation = {
      longitude: SosHQ?.location.lng || 0,
      latitude: SosHQ?.location.lat || 0,
      radius: SosHQ?.coverageRadiusKm || 6,  // Example radius in meters, adjust as needed
    };
    if(!hqLocation){
      throw new ValidationError('SOS HQ location not found');
    }
    if(hqLocation.latitude === 0 || hqLocation.longitude === 0){
      throw new ValidationError('Invalid SOS HQ location coordinates');
    }

    console.log('Query Params:', req.query);
    // Parse filters from query parameters
    const filters: any = {};
    
    // Handle nested filter object from BFF
    if (filter && typeof filter === 'object') {
      const filterObj = filter as any;
      
      // Parse date filters
      if (filterObj.date) {
        filters.date = filterObj.date;
      }

      // Parse type filters - convert string to array if needed
      if (filterObj.type) {
        filters.type = Array.isArray(filterObj.type) 
          ? filterObj.type 
          : typeof filterObj.type === 'string'
          ? filterObj.type.split(',').map((t: string) => t.trim())
          : [];
      }

      // Parse status filters - convert string to array if needed
      if (filterObj.status) {
        filters.status = Array.isArray(filterObj.status)
          ? filterObj.status
          : typeof filterObj.status === 'string'
          ? filterObj.status.split(',').map((s: string) => s.trim())
          : [];
      }

      // Parse soNo filter
      if (filterObj.soNo) {
        filters.soNo = filterObj.soNo;
      }

      // Parse citizenId filter
      if (filterObj.citizenId) {
        filters.citizenId = filterObj.citizenId;
      }
    }

    // Build options object
    const options: any = {};
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

    const results = await this.sosService.listSOS(cityId as string || '', options, hqLocation);

    res.status(200).json({
      success: true,
      data: results,
      timestamp: new Date(),
    });
  }

  /**
   * POST /sos/{sosId}/location
   * Update Citizen Location (CITIZEN only)
   */
  async updateLocation(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.CITIZEN) {
      throw new ForbiddenError('Only citizens can update location');
    }

    const { sosId } = req.params;
    const { lat, lng, accuracy } = req.body;
    const { id: citizenId, cityId } = req.user;

    // Verify SOS ownership
    const sos = await this.sosService.getSOS(sosId);
    if (!sos) {
      throw new NotFoundError('SOS request', sosId);
    }

    if (sos.citizenId !== citizenId) {
      throw new ForbiddenError('Cannot update location of another citizen');
    }

    const updated = await this.sosService.updateLocation(sosId, cityId || '', {
      lat,
      lng,
      accuracy,
    });

    res.status(201).json({
      success: true,
      data: {
        sosId: updated.id,
        location: updated.lastKnownLocation,
      },
      timestamp: new Date(),
    });
  }

  /**
   * POST /sos/{sosId}/messages
   * Send Message (CITIZEN or ADMIN)
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    if (!req.user || (req.user.role !== UserRole.CITIZEN && req.user.role !== UserRole.APP_ADMIN && req.user.role !== UserRole.CITY_ADMIN && req.user.role !== UserRole.SOS_ADMIN && req.user.role !== UserRole.RESCUER)) {
      throw new ForbiddenError('Only citizens, rescuers and admins can send messages');
    }

    const { sosId } = req.params;
    const { content } = req.body;
    const { id: userId, role, cityId } = req.user;

    // Verify SOS exists
    const sos = await this.sosService.getSOS(sosId);
    if (!sos) {
      throw new NotFoundError('SOS request', sosId);
    }

    // Citizen can only message their own SOS
    if (role === UserRole.CITIZEN && sos.citizenId !== userId) {
      throw new ForbiddenError('Cannot message another citizen\'s SOS');
    }

    const message = await this.sosService.sendMessage(sosId, cityId || '', {
      content,
      senderRole: role.toLowerCase(),
      senderId: userId,
    });

    res.status(201).json({
      success: true,
      data: {
        messageId: message.id,
        content: message.content,
        createdAt: message.createdAt,
      },
      timestamp: new Date(),
    });
  }

  /**
   * POST /sos/{sosId}/cancel
   * Cancel SOS (CITIZEN only)
   */
  async cancelSOS(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.CITIZEN) {
      throw new ForbiddenError('Only citizens can cancel SOS');
    }

    const { sosId } = req.params;
    const { id: citizenId, cityId } = req.user;

    // Verify SOS ownership
    const sos = await this.sosService.getSOS(sosId);
    if (!sos) {
      throw new NotFoundError('SOS request', sosId);
    }

    if (sos.citizenId !== citizenId) {
      throw new ForbiddenError('Cannot cancel another citizen\'s SOS');
    }

    const cancelled = await this.statusMachine.cancelSOS(sosId, cityId || '', citizenId);

    res.status(200).json({
      success: true,
      data: {
        sosId: cancelled?.id,
        status: cancelled?.status,
      },
      timestamp: new Date(),
    });
  }

  async updateSOSStatus(req: Request, res: Response): Promise<void> {
    const { sosId } = req.params;
    const { status, resolutionNote  } = req.body;
    const updatedSOS = await this.statusMachine.updateSOSStatus(sosId, status, resolutionNote);
    
    res.status(200).json({
      success: true,
      data: updatedSOS,
      timestamp: new Date(),
    });
  }

  /**
   * POST /sos/{sosId}/close :: resolutionNote
   * Close/Resolve SOS (ADMIN only)
   */
  async closeSOS(req: Request, res: Response): Promise<void> {
    if (!req.user || (req.user.role !== UserRole.APP_ADMIN && req.user.role !== UserRole.CITY_ADMIN && req.user.role !== UserRole.SOS_ADMIN)) {
      throw new ForbiddenError('Only admins can close SOS requests');
    }

    const { sosId } = req.params;
    const { resolutionNote } = req.body;
    const { cityId } = req.user;

    const closed = await this.statusMachine.closeSOS(sosId, cityId || '', resolutionNote);
    if (!closed) {
      throw new NotFoundError('SOS request', sosId);
    }

    res.status(200).json({
      success: true,
      data: {
        sosId: closed.id,
        status: closed.status,
      },
      timestamp: new Date(),
    });
  }

  /**
   * POST /internal/sos/{sosId}/location-snapshot
   * Save Location Snapshot from Realtime Service
   * Called by location sampler when meaningful location change occurs
   * Internal endpoint - no auth check needed (internal service call)
   */
  async saveLocationSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { latitude, longitude, accuracy , address} = req.body;
      const cityId = req.headers['x-city-id'] as string;
      const deviceId = req.headers['x-device-id'] as string;
      
      if( !deviceId ) {
        throw new ValidationError('Missing deviceId in headers');
      }

      if (!sosId || latitude === undefined || longitude === undefined) {
        throw new ValidationError(
          'Missing required fields: sosId, latitude, longitude'
        );
      }

      if(address === undefined) {
        console.log('Saving location snapshot without address');
        const result = await this.sosService.saveLocationSnapshot(sosId, {
          latitude,
          longitude,
          accuracy: accuracy || 0,
          deviceId,
        }, cityId);
        res.status(200).json({
          success: true,
          data: result,
          timestamp: new Date(),
        });
        return;
      }

      // Save location snapshot without citizen auth check
      // (called internally from realtime service)
      const result = await this.sosService.saveLocationSnapshot(sosId, {
        latitude,
        longitude,
        accuracy: accuracy || 0,
        address,
        deviceId,
      }, cityId);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
      return;
    } catch (error) {
      console.error('Error saving location snapshot', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * PATCH /sos/{sosId}/type
   * Update SOS Tag/Type 
   */
  async updateSosTag(req: Request, res: Response): Promise<void> {
 
    const { sosId } = req.params;
    const { tag } = req.body; 
    

    const updatedSOS = await this.sosService.updateTag(sosId, tag);

    res.status(200).json({
      success: true,
      data: updatedSOS,
      timestamp: new Date(),
    });
  }

  async createAnonRescuer(req: Request, res: Response): Promise<void> {
 
    const { sosId } = req.params;
    const { requestMissionId } = req.body; 
    const cityCode = req.headers['x-city-code'] as string;
    const token = await this.sosService.createAnonRescuer(sosId, requestMissionId, cityCode);

    res.status(201).json({
      success: true,
      data: token,
      message: 'Anon rescuer created',
      timestamp: new Date(),
    });
  }
}