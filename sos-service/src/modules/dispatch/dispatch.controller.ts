import { Request, Response } from 'express';
import { SOSRepository } from '../sos/sos.repository';
import { StatusMachineService } from '../sos/statusMachine.service';
import { eventEmitter } from '../../services/eventEmitter';

/**
 * Internal API controller for service-to-service communication
 * These endpoints should only be accessible from authenticated internal services
 */
export class DispatchController {
  constructor(private sosRepository: SOSRepository, private statusMachine: StatusMachineService) {}

  /**
   * POST /internal/dispatch/assign
   * Assign rescuer to SOS (called by dispatch service)
   *
   * Requires:
   * - X-Service-Auth header (or similar internal auth)
   */
  async assignRescuer(req: Request, res: Response): Promise<void> {
    try {
      // In production, verify internal service authentication
      const { sosId, rescuerId } = req.validatedBody;
      const { cityId } = req.user || { cityId: req.headers['x-city-id'] };

      if (!cityId) {
        res.status(400).json({ error: 'Missing X-City-Id header' });
        return;
      }

      // Get current SOS
      const sos = await this.sosRepository.findById(cityId as string, sosId);
      if (!sos) {
        res.status(404).json({ error: 'SOS not found' });
        return;
      }

      // Assign rescuer and auto-transition to EN_ROUTE
      const updated = await this.statusMachine.handleRescuerAssignment(sosId, cityId as string, rescuerId);

      // Publish event
      eventEmitter.publishSOSEvent({
        type: 'RESCUER_ASSIGNED',
        sosId,
        cityId: cityId as string,
        timestamp: new Date(),
        data: {
          sosId,
          rescuerId,
          previousStatus: sos.status,
          newStatus: updated?.status,
        },
      });

      res.status(200).json({
        sosId,
        rescuerId,
        status: updated?.status,
        message: 'Rescuer assigned successfully',
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
