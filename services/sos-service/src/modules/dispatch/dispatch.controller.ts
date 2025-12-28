import { Request, Response } from 'express';
import { SOSRepository } from '../sos/sos.repository';
import { StatusMachineService } from '../sos/statusMachine.service';
import { NotFoundError, ValidationError } from '../../errors';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DispatchController');

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
    // In production, verify internal service authentication
    const { sosId, rescuerId } = req.validatedBody;
    const { cityId } = req.user || { cityId: req.headers['x-city-id'] };

    if (!cityId) {
      throw new ValidationError('Missing city ID in headers or user context');
    }

    // Get current SOS
    const sos = await this.sosRepository.findById(sosId);
    if (!sos) {
      throw new NotFoundError('SOS request', sosId);
    }

    // Assign rescuer and auto-transition to EN_ROUTE
    const updated = await this.statusMachine.handleRescuerAssignment(sosId, cityId as string, rescuerId);

    // Publish event
    // eventEmitter.publishSOSEvent({
    //   type: 'RESCUER_ASSIGNED',
    //   sosId,
    //   cityId: cityId as string,
    //   timestamp: new Date(),
    //   data: {
    //     sosId,
    //     rescuerId,
    //     previousStatus: sos.status,
    //     newStatus: updated?.status,
    //   },
    // });

    res.status(200).json({
      success: true,
      data: {
        sosId,
        rescuerId,
        status: updated?.status,
        message: 'Rescuer assigned successfully',
      },
      timestamp: new Date(),
    });
  }
}
