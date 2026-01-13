import { Request, Response } from 'express';
import { SOSRepository } from '../sos/sos.repository';
import { StatusMachineService } from '../sos/statusMachine.service';
import { UserRole } from '../../middleware/roleGuard';
import { ForbiddenError, NotFoundError } from '../../errors';
import { createLogger } from '../../utils/logger';
import { identityClient } from '../../services/identity.client';

const logger = createLogger('RescuerController');

/**
 * Rescuer-facing controller
 * Minimal interface for rescuer operations
 */
export class RescuerController {
  constructor(private sosRepository: SOSRepository, private statusMachine: StatusMachineService) {}

  async getRescuersByCity(req: Request, res: Response): Promise<void> {
    try {
      const { municipalityCode } = req.params;
      const rescuers = await identityClient.getRescuersByCity(municipalityCode);
      res.status(200).json({
        success: true,
        data: rescuers,
        timestamp: new Date(),
      });
    }catch (error) {
      logger.error('Error fetching rescuers by city:', JSON.stringify(error));
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  /**
   * GET /rescuer/assignment
   * Get assigned SOS for rescuer
   */
  async getAssignment(req: Request, res: Response): Promise<void> {
    try {
      
      if (!req.user || req.user.role !== UserRole.RESCUER) {
        throw new ForbiddenError('Only rescuers can access assignments');
      }

      const { id: rescuerId, cityId } = req.user;

      if (!cityId) {
        throw new ForbiddenError('City ID is required');
      }

      if(!rescuerId){
        throw new ForbiddenError('Rescuer ID is required');
      }

      // Find SOS assigned to this rescuer (in EN_ROUTE or ARRIVED status)
      const assignments = await this.sosRepository.findByRescuerId(cityId, rescuerId);
      const activeAssignment = assignments.find((sos) => sos.status === 'EN_ROUTE' || sos.status === 'ARRIVED');

      if (!activeAssignment) {
        throw new NotFoundError('Active assignment');
      }
      logger.info(`Rescuer ${rescuerId} fetched assignment ${activeAssignment.id}`, activeAssignment);
      const targetLat = activeAssignment.lastKnownLocation.coordinates ? activeAssignment.lastKnownLocation.coordinates[1] : null;
      const targetLng = activeAssignment.lastKnownLocation.coordinates ? activeAssignment.lastKnownLocation.coordinates[0] : null;
      res.status(200).json({
        success: true,
        data: {
          sosId: activeAssignment.id,
          target: {
            lat: targetLat,
            lng: targetLng,
          },
          status: activeAssignment.status,
          // citizenPhone would come from a citizen service, omitted for now
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error in getAssignment:', JSON.stringify(error));
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /rescuer/location
   * Rescuer pushes their location
   * Backend automatically transitions status based on distance
   */
  async updateRescuerLocation(req: Request, res: Response): Promise<void> {
    if (!req.user || req.user.role !== UserRole.RESCUER) {
      throw new ForbiddenError('Only rescuers can update location');
    }

    const { lat, lng } = req.body;
    const { id: rescuerId, cityId } = req.user;

    if (!cityId) {
      throw new ForbiddenError('City ID is required');
    }
    if(!rescuerId){
      throw new ForbiddenError('Rescuer ID is required');
    }

    // Find active assignment for this rescuer
    const assignments = await this.sosRepository.findByRescuerId(cityId, rescuerId);
    const activeAssignment = assignments.find((sos) => sos.status === 'EN_ROUTE' || sos.status === 'ARRIVED');

    if (!activeAssignment) {
      throw new NotFoundError('Active assignment');
    }

    // Check distance and potentially auto-transition
    const updated = await this.statusMachine.handleRescuerLocation(
      activeAssignment.id,
      cityId,
      lat,
      lng,
    );

    // // Publish rescuer location event
    // eventEmitter.publishSOSEvent({
    //   type: 'LOCATION_UPDATED',
    //   sosId: activeAssignment.id,
    //   cityId,
    //   timestamp: new Date(),
    //   data: {
    //     sosId: activeAssignment.id,
    //     rescuerId,
    //     rescuerLocation: { lat, lng },
    //     sosStatus: updated?.status,
    //   },
    // });

    res.status(201).json({
      success: true,
      data: {
        sosId: activeAssignment.id,
        status: updated?.status,
        distance: this.calculateDistance(
          lat,
          lng,
          activeAssignment.lastKnownLocation.coordinates[1],
          activeAssignment.lastKnownLocation.coordinates[0],
        ),
      },
      timestamp: new Date(),
    });
  }

  /**
   * Calculate distance in meters using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
