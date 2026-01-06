import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { ParticipantsController } from './participants.controller';
import { logger } from '../../utils/logger';

/**
 * Create participants routes
 * 
 * These are internal API endpoints called by the SOS Service
 * to trigger participant-related socket events.
 */
export const createParticipantsRoutes = (io: SocketIOServer): Router => {
  const router = Router();
  const controller = new ParticipantsController(io);

  // Middleware to validate internal requests
  router.use((req, res, next) => {
    const internalToken = req.headers['x-internal-request'];
    if (internalToken !== 'true') {
      logger.warn('Unauthorized internal request', {
        path: req.path,
        ip: req.ip,
      });
      res.status(403).json({
        success: false,
        message: 'Forbidden: Internal endpoint requires X-Internal-Request header',
      });
      return;
    }
    next();
  });

  /**
   * Broadcast participant joined event
   * POST /api/participants/joined
   * 
   * Request body:
   * {
   *   sosId: string,
   *   userId: string,
   *   userType: 'admin' | 'rescuer' | 'citizen',
   *   displayName?: string,
   *   joinedAt?: Date
   * }
   */
  router.post('/joined', (req, res) =>
    controller.broadcastParticipantJoined(req, res).catch((err) => {
      logger.error('Error in broadcastParticipantJoined route', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }),
  );

  /**
   * Broadcast participant left event
   * POST /api/participants/left
   * 
   * Request body:
   * {
   *   sosId: string,
   *   userId: string,
   *   leftAt?: Date
   * }
   */
  router.post('/left', (req, res) =>
    controller.broadcastParticipantLeft(req, res).catch((err) => {
      logger.error('Error in broadcastParticipantLeft route', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }),
  );

  /**
   * Get active participants in a SOS room
   * GET /api/participants/:sosId/active
   * 
   * Returns list of currently connected participants
   */
  router.get('/:sosId/active', (req, res) =>
    controller.getActiveParticipants(req, res).catch((err) => {
      logger.error('Error in getActiveParticipants route', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }),
  );

  /**
   * Get participant count in a SOS room
   * GET /api/participants/:sosId/count
   * 
   * Returns number of currently connected participants
   */
  router.get('/:sosId/count', (req, res) =>
    controller.getParticipantCount(req, res).catch((err) => {
      logger.error('Error in getParticipantCount route', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }),
  );

  return router;
};
