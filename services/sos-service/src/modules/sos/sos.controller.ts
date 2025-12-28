import { Request, Response } from 'express';
import { SOSService } from './sos.service';
import { StatusMachineService } from './statusMachine.service';
import { UserRole } from '../../middleware/roleGuard';
import { ForbiddenError, NotFoundError, ValidationError } from '../../errors';
import { createLogger } from '../../utils/logger';
import { CounterService } from '../counter';

const logger = createLogger('SOSController');

export class SOSController {
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
    if (!req.user || req.user.role !== UserRole.CITIZEN) {
      throw new ForbiddenError('Only citizens can create SOS requests');
    }

    const deviceId = req.headers['x-device-id'] as string;
    if( !deviceId ) {
      throw new ValidationError('Missing deviceId in headers');
    }

    const { type, message, silent, address } = req.body;
    const { id: citizenId, cityId } = req.user;

    const location = req.body.location;
    const barangay = address?.barangay || '';
    const city = address?.city || '';

    const existingSOS = await this.sosService.getActiveSOSByCitizen(citizenId);
    if (existingSOS) {
      throw new ValidationError('An active SOS request already exists for this citizen');
    }


    const sos = await this.sosService.createSOS({
      type,
      message,
      citizenId,
      cityId,
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

  /**
   * GET /sos
   * List Active SOS
   */
  async listSOS(req: Request, res: Response): Promise<void> {

    if(req.user && req.user.role === UserRole.CITIZEN) {
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

    const { cityId } = req.user;
    const { status } = req.query;

    let results;
    if (status) {
      results = await this.sosService.listByStatus(cityId, status as string);
    } else {
      results = await this.sosService.listSOS(cityId);
    }

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

    const updated = await this.sosService.updateLocation(sosId, cityId, {
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
    if (!req.user || (req.user.role !== UserRole.CITIZEN && req.user.role !== UserRole.APP_ADMIN && req.user.role !== UserRole.CITY_ADMIN && req.user.role !== UserRole.SOS_ADMIN)) {
      throw new ForbiddenError('Only citizens and admins can send messages');
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

    const message = await this.sosService.sendMessage(sosId, cityId, {
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

    const cancelled = await this.statusMachine.cancelSOS(sosId, cityId);

    res.status(200).json({
      success: true,
      data: {
        sosId: cancelled?.id,
        status: cancelled?.status,
      },
      timestamp: new Date(),
    });
  }

  /**
   * POST /sos/{sosId}/close
   * Close/Resolve SOS (ADMIN only)
   */
  async closeSOS(req: Request, res: Response): Promise<void> {
    if (!req.user || (req.user.role !== UserRole.APP_ADMIN && req.user.role !== UserRole.CITY_ADMIN && req.user.role !== UserRole.SOS_ADMIN)) {
      throw new ForbiddenError('Only admins can close SOS requests');
    }

    const { sosId } = req.params;
    const { resolutionNote } = req.body;
    const { cityId } = req.user;

    const closed = await this.statusMachine.closeSOS(sosId, cityId, resolutionNote);
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
    const { sosId } = req.params;
    const { latitude, longitude, accuracy , address} = req.body;
    const cityId = req.headers['x-city-id'] as string;
    const deviceId = req.headers['x-device-id'] as string;
    
    if( !deviceId ) {
      throw new ValidationError('Missing deviceId in headers');
    }

    if (!sosId || latitude === undefined || longitude === undefined || address === undefined) {
      throw new ValidationError(
        'Missing required fields: sosId, latitude, longitude, address'
      );
    }

    if(address.city === undefined || address.barangay === undefined) {
      throw new ValidationError(
        'Address must include city and barangay'
      );
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
}