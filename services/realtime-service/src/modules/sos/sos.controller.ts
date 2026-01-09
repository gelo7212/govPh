import { Request, Response } from 'express';
import { SOSService } from './sos.service';
import { StatusMachineService } from './statusMachine.service';
import { logger } from '../../utils/logger';

/**
 * SOS Controller - Handles internal HTTP requests
 * These are calls from SOS MS to coordinate realtime events
 */
export class SOSController {
  constructor(
    private sosService: SOSService,
    private statusMachine: StatusMachineService,
  ) {}

  /**
   * Initialize SOS realtime context
   */
  async initSOS(req: Request, res: Response): Promise<void> {
    try {
      const { sosId, citizenId, location ,address} = req.body;

      logger.info('Initializing SOS realtime context', { sosId, citizenId });

      const result = await this.sosService.initSOS(sosId, citizenId, location, address);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error initializing SOS', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize SOS',
      });
    }
  }

  /**
   * Close SOS realtime context
   */
  async closeSOS(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { closedBy } = req.body;

      logger.info('Closing SOS realtime context', { sosId, closedBy });

      await this.sosService.closeSOS(sosId, closedBy);

      res.status(200).json({
        success: true,
        message: 'SOS closed',
      });
    } catch (error) {
      logger.error('Error closing SOS', error);
      res.status(500).json({
        success: false,
        error: 'Failed to close SOS',
      });
    }
  }

  /**
   * Update SOS status
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { status, updatedBy, oldStatus } = req.body;

      logger.info('Updating SOS status', { sosId, status });

      const newStatus = await this.statusMachine.transition(sosId, status, updatedBy, oldStatus);
      this.sosService.closeSOS(sosId, updatedBy);
      res.status(200).json({
        success: true,
        data: newStatus,
      });
    } catch (error) {
      logger.error('Error updating status', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update status',
      });
    }
  }

  /**
   * Get SOS realtime state
   */
  async getSOSState(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;

      const state = await this.sosService.getSOSState(sosId);

      if (!state) {
        res.status(404).json({
          success: false,
          error: 'SOS not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: state,
      });
    } catch (error) {
      logger.error('Error getting SOS state', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve SOS state',
      });
    }
  }

  /**
   * Save location snapshot from realtime service
   * Called by location sampler when location threshold is exceeded
   */
  async saveLocationSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { latitude, longitude, accuracy, userId, address } = req.body;

      logger.info('Saving location snapshot', {
        sosId,
        latitude,
        longitude,
        userId,
      });

      // Update both Redis and will be persisted by SOS service
      await this.sosService.updateSOSLocation(sosId, {
        latitude,
        longitude,
        accuracy,
      }, address);

      res.status(200).json({
        success: true,
        message: 'Location snapshot saved',
      });
    } catch (error) {
      logger.error('Error saving location snapshot', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save location snapshot',
      });
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
      const states = await this.sosService.getSOSNearbyLocation(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseInt(radius as string)
      );
      res.status(200).json({
        success: true,
        data: states,
      });
    } catch (error) {
      logger.error('Error getting nearby SOS states', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve nearby SOS states',
      });
    }
  }

  async upsertRescuerLocation(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { rescuerId, latitude, longitude, accuracy } = req.body;
      if (!rescuerId || !latitude || !longitude) {
        res.status(400).json({
          success: false,
          error: 'rescuerId, latitude, and longitude are required fields',
        });
        return;
      }
      await this.sosService.upsertRescuerLocation(
        rescuerId,
        {
          latitude,
          longitude,
          accuracy,
        },
        sosId
      );
      res.status(200).json({
        success: true,
        message: 'Rescuer location upserted successfully',
      });
    } catch (error) {
      logger.error('Error upserting rescuer location', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upsert rescuer location',
      });
    }
  }
}

export default SOSController;
