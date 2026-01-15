import { Request, Response } from 'express';
import { SOSService } from './sos.service';
import { logger } from '../../utils/logger';
import { Server as SocketIOServer } from 'socket.io';
import { SOCKET_EVENTS } from '../../utils/constants';
/**
 * SOS Controller - Handles internal HTTP requests
 * These are calls from SOS MS to coordinate realtime events
 */
export class SOSController {
  constructor(
    private sosService: SOSService,
    private io : SocketIOServer
  ) {}

  /**
   * Initialize SOS realtime context
   */
  async initSOS(req: Request, res: Response): Promise<void> {
    try {
      const { sosId, citizenId, location ,address, type, soNo} = req.body;

      logger.info('Initializing SOS realtime context', { sosId, citizenId });

      const result = await this.sosService.initSOS(sosId, citizenId, location, address, type, undefined, soNo);
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

  async syncSOSState(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      await this.sosService.syncSOS(sosId, req.headers);
      res.status(200).json({
        success: true,
        message: 'SOS state synchronized',
      });
    } catch (error) {
      logger.error('Error synchronizing SOS state', error);
      res.status(500).json({
        success: false,
        error: 'Failed to synchronize SOS state',
      });
    }
  }

  async updateSosType(req: Request, _res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { type } = req.body;
      await this.sosService.updateSosType(sosId, type);
    } catch (error) {
      logger.error('Error updating SOS type', error);
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
      const { status, updatedBy } = req.body;

      logger.info('Updating SOS status', { sosId, status });

      // const newStatus = await this.statusMachine.transition(sosId, status, updatedBy, oldStatus);
      // Broadcast status update to all clients in the SOS room
      const roomName = `sos:${sosId}`;
      const room = this.io.sockets.adapter.rooms.get(roomName);
      const clientsInRoom = room ? room.size : 0;
      
      logger.info('Broadcasting to SOS room', { sosId, roomName, clientsInRoom });
      
      const broadcastPayload = {
        sosId,
        status,
        updatedBy,
        timestamp: Date.now(),
      };
      
      console.log(`🔴 Emitting ${SOCKET_EVENTS.SOS_STATUS_BROADCAST} to room ${roomName}:`, broadcastPayload);
      this.io.to(roomName).emit(SOCKET_EVENTS.SOS_STATUS_BROADCAST, broadcastPayload);

      logger.info('SOS status update broadcasted', { sosId, status, clientsInRoom, eventName: SOCKET_EVENTS.SOS_STATUS_BROADCAST });

      if(
          status === 'en_route' ||
          status === 'arrived' ||
          status === 'active' || 
          status !== 'closed' || 
          status !== 'resolved' || 
          status !== 'cancelled' || 
          status !== 'fake' ||
          status !== 'completed' ||
          status !== 'rejected'
        ){
        // Notify SOS service to handle dispatch related updates
        await this.sosService.updateStatus(sosId, status);
        res.status(200).json({
          success: true,
          data: status,
        });
        return;
      }
      await this.sosService.closeSOS(sosId, updatedBy);
      this.io.to(roomName).emit(SOCKET_EVENTS.SOS_CLOSE, broadcastPayload);
      res.status(200).json({
        success: true,
        data: status,
      });
      return;
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

      const location = {
        latitude,
        longitude,
        accuracy,
      }
      const roomName = `sos:${sosId}`;
      const result = await this.sosService.upsertRescuerLocation(
        rescuerId,
        {
          latitude,
          longitude,
          accuracy,
        },
        sosId
      );
      
      // Broadcast rescuer location update to all clients in the SOS room
      this.io.to(roomName).emit(`rescuer:location:broadcast`, {
        rescuerId,
        location,
        sosId,
        isArrived: result.rescuerArrived,
      });
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

  async getRescuerLocation(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { rescuerId } = req.query;
      if (!rescuerId) {
        res.status(400).json({
          success: false,
          error: 'rescuerId is a required query parameter',
        });
        return;
      }
      const locations = await this.sosService.getRescuerLocation(rescuerId as string, sosId);

      res.status(200).json({
        success: true,
        data: locations,
      });
    } catch (error) {
      logger.error('Error getting rescuer locations', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve rescuer locations',
      });
    }
  }
}

export default SOSController;
