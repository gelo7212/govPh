import { Router } from 'express';
import { SosParticipantController } from './participant.controller';
import { SosParticipantService } from './participant.service';
import { ParticipantRepository } from './participant.repository';

const router = Router();
const repository = new ParticipantRepository();
const service = new SosParticipantService(repository);
const controller = new SosParticipantController(service);

/**
 * Join a SOS
 * POST /:sosId/participants/join
 */
router.post('/:sosId/participants/join', (req, res, next) =>
  controller.joinSos(req, res).catch(next),
);

/**
 * Leave a SOS
 * PATCH /:sosId/participants/:userId/leave
 */
router.patch('/:sosId/participants/:userId/leave', (req, res, next) =>
  controller.leaveSos(req, res).catch(next),
);

/**
 * Get active participants
 * GET /:sosId/participants/active
 */
router.get('/:sosId/participants/active', (req, res, next) =>
  controller.getActiveParticipants(req, res).catch(next),
);

/**
 * Get participant history
 * GET /:sosId/participants/history
 */
router.get('/:sosId/participants/history', (req, res, next) =>
  controller.getParticipantHistory(req, res).catch(next),
);

/**
 * Check if user is active participant
 * GET /:sosId/participants/:userId/check
 */
router.get('/:sosId/participants/:userId/check', (req, res, next) =>
  controller.checkActiveParticipation(req, res).catch(next),
);

/**
 * Get user's participation history
 * GET /user/:userId/history
 */
router.get('/user/:userId/history', (req, res, next) =>
  controller.getUserParticipationHistory(req, res).catch(next),
);

export default router;
