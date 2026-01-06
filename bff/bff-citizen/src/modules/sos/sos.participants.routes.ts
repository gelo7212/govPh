import { Router } from 'express';
import { SosParticipantsController } from './sos.participants.controller';
import { SosParticipantsAggregator } from './sos.participants.aggregator';
import { authContextMiddleware } from '../../middlewares/authContext';

/**
 * SOS Participants Routes - BFF Admin
 * Routes for participant management operations
 */
export function createSosParticipantsRoutes(): Router {
  const router = Router({ mergeParams: true });

  // Initialize aggregator and controller
  const sosServiceUrl = process.env.SOS_SERVICE_URL || 'http://govph-sos:3000';
  const aggregator = new SosParticipantsAggregator(sosServiceUrl);
  const controller = new SosParticipantsController(aggregator);

  /**
   * Join a SOS as a participant
   * POST /api/sos/:sosId/participants/join
   */
  router.post('/join',authContextMiddleware, (req, res, next) =>
    controller.joinSos(req, res).catch(next),
  );

  /**
   * Leave a SOS participation
   * PATCH /api/sos/:sosId/participants/:userId/leave
   */
  router.patch('/:userId/leave',authContextMiddleware , (req, res, next) =>
    controller.leaveSos(req, res).catch(next),
  );

  /**
   * Get active participants in a SOS
   * GET /api/sos/:sosId/participants/active
   */
  router.get('/active',authContextMiddleware, (req, res, next) =>
    controller.getActiveParticipants(req, res).catch(next),
  );

  /**
   * Get participant history for a SOS
   * GET /api/sos/:sosId/participants/history
   */
  router.get('/history',authContextMiddleware, (req, res, next) =>
    controller.getParticipantHistory(req, res).catch(next),
  );

  /**
   * Check if user is active participant
   * GET /api/sos/:sosId/participants/:userId/check
   */
  router.get('/:userId/check',authContextMiddleware, (req, res, next) =>
    controller.checkActiveParticipation(req, res).catch(next),
  );

  /**
   * Get user's participation history
   * GET /api/sos/:sosId/participants/user/:userId/history
   */
  router.get('/user/:userId/history',authContextMiddleware, (req, res, next) =>
    controller.getUserParticipationHistory(req, res).catch(next),
  );

  return router;
}

export default createSosParticipantsRoutes;
