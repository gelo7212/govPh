import { Request, Response } from 'express';
import { SOSRepository } from '../sos/sos.repository';
import { StatusMachineService } from '../sos/statusMachine.service';
import { UserRole } from '../../middleware/roleGuard';
import { eventEmitter } from '../../services/eventEmitter';

/**
 * Rescuer-facing controller
 * Minimal interface for rescuer operations
 */
export class RescuerController {
  constructor(private sosRepository: SOSRepository, private statusMachine: StatusMachineService) {}

  /**
   * GET /rescuer/assignment
   * Get assigned SOS for rescuer
   */
  async getAssignment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.RESCUER) {
        res.status(403).json({ error: 'Only rescuers can access assignments' });
        return;
      }

      const { id: rescuerId, cityId } = req.user;

      // Find SOS assigned to this rescuer (in EN_ROUTE or ARRIVED status)
      const assignments = await this.sosRepository.findByRescuerId(cityId, rescuerId);
      const activeAssignment = assignments.find((sos) => sos.status === 'EN_ROUTE' || sos.status === 'ARRIVED');

      if (!activeAssignment) {
        res.status(404).json({ error: 'No active assignment' });
        return;
      }

      res.json({
        sosId: activeAssignment.id,
        target: {
          lat: activeAssignment.lastKnownLocation.coordinates[1],
          lng: activeAssignment.lastKnownLocation.coordinates[0],
        },
        status: activeAssignment.status,
        // citizenPhone would come from a citizen service, omitted for now
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * POST /rescuer/location
   * Rescuer pushes their location
   * Backend automatically transitions status based on distance
   */
  async updateRescuerLocation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.RESCUER) {
        res.status(403).json({ error: 'Only rescuers can update location' });
        return;
      }

      const { lat, lng } = req.validatedBody;
      const { id: rescuerId, cityId } = req.user;

      // Find active assignment for this rescuer
      const assignments = await this.sosRepository.findByRescuerId(cityId, rescuerId);
      const activeAssignment = assignments.find((sos) => sos.status === 'EN_ROUTE' || sos.status === 'ARRIVED');

      if (!activeAssignment) {
        res.status(404).json({ error: 'No active assignment' });
        return;
      }

      // Check distance and potentially auto-transition
      const updated = await this.statusMachine.handleRescuerLocation(
        activeAssignment.id,
        cityId,
        lat,
        lng,
      );

      // Publish rescuer location event
      eventEmitter.publishSOSEvent({
        type: 'LOCATION_UPDATED',
        sosId: activeAssignment.id,
        cityId,
        timestamp: new Date(),
        data: {
          sosId: activeAssignment.id,
          rescuerId,
          rescuerLocation: { lat, lng },
          sosStatus: updated?.status,
        },
      });

      res.status(201).json({
        sosId: activeAssignment.id,
        status: updated?.status,
        distance: this.calculateDistance(
          lat,
          lng,
          activeAssignment.lastKnownLocation.coordinates[1],
          activeAssignment.lastKnownLocation.coordinates[0],
        ),
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
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
