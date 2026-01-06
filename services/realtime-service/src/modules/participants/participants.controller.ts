import { Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../../utils/logger';

/**
 * Participants Controller
 * 
 * Handles API calls from SOS Service to trigger participant-related socket events.
 * These endpoints are internal-only, called by the SOS Service.
 */
export class ParticipantsController {
  constructor(private io: SocketIOServer) {}

  /**
   * Broadcast participant joined event to SOS room
   * Called by SOS Service after a participant joins
   * 
   * POST /api/participants/joined
   */
  async broadcastParticipantJoined(req: Request, res: Response): Promise<void> {
    try {
      const { sosId, userId, userType, displayName, joinedAt } = req.body;

      // Validate required fields
      if (!sosId || !userId || !userType) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: sosId, userId, userType',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.info('Broadcasting participant joined', {
        sosId,
        userId,
        userType,
      });

      // Broadcast to all clients in SOS room
      this.io.to(roomName).emit('participant:joined', {
        sosId,
        userId,
        userType,
        displayName,
        joinedAt: joinedAt || new Date(),
        timestamp: Date.now(),
      });

      res.status(200).json({
        success: true,
        message: 'Participant joined event broadcasted',
        data: {
          sosId,
          userId,
          userType,
          roomName,
        },
      });
    } catch (error) {
      logger.error('Error broadcasting participant joined', error);
      res.status(500).json({
        success: false,
        message: 'Error broadcasting participant joined',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Broadcast participant left event to SOS room
   * Called by SOS Service after a participant leaves
   * 
   * POST /api/participants/left
   */
  async broadcastParticipantLeft(req: Request, res: Response): Promise<void> {
    try {
      const { sosId, userId, leftAt } = req.body;

      // Validate required fields
      if (!sosId || !userId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: sosId, userId',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.info('Broadcasting participant left', {
        sosId,
        userId,
      });

      // Broadcast to all clients in SOS room
      this.io.to(roomName).emit('participant:left', {
        sosId,
        userId,
        leftAt: leftAt || new Date(),
        timestamp: Date.now(),
      });

      // Also force the participant's sockets to leave the room
      const sockets = await this.io.in(roomName).fetchSockets();
      const participantSockets = sockets.filter(
        (s) => (s as any).userId === userId,
      );
      participantSockets.forEach((s) => s.leave(roomName));

      res.status(200).json({
        success: true,
        message: 'Participant left event broadcasted',
        data: {
          sosId,
          userId,
          roomName,
        },
      });
    } catch (error) {
      logger.error('Error broadcasting participant left', error);
      res.status(500).json({
        success: false,
        message: 'Error broadcasting participant left',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get active participants in a SOS room
   * 
   * GET /api/participants/:sosId/active
   */
  async getActiveParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;

      if (!sosId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameter: sosId',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.info('Fetching active participants', { sosId });

      // Get all sockets in the SOS room
      const sockets = await this.io.in(roomName).fetchSockets();

      // Build participant list from connected sockets
      const activeParticipants = sockets.map((s) => ({
        userId: (s as any).userId,
        displayName: s.data.displayName || 'Unknown',
        userType: s.data.userType || 'unknown',
        socketId: s.id,
        connectedAt: (s as any).connectedAt || Date.now(),
      }));

      res.status(200).json({
        success: true,
        data: {
          sosId,
          participants: activeParticipants,
          count: activeParticipants.length,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      logger.error('Error fetching active participants', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching active participants',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get number of active sockets in a SOS room
   * 
   * GET /api/participants/:sosId/count
   */
  async getParticipantCount(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;

      if (!sosId) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameter: sosId',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      // Get count of sockets in the room
      const sockets = await this.io.in(roomName).fetchSockets();

      res.status(200).json({
        success: true,
        data: {
          sosId,
          count: sockets.length,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      logger.error('Error fetching participant count', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching participant count',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
