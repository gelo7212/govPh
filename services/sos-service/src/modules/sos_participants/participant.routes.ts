import { Router } from 'express';
import { SosParticipantController } from './participant.controller';
import { SosParticipantService } from './participant.service';
import { ParticipantRepository } from './participant.repository';

const router = Router({ mergeParams: true });
const repository = new ParticipantRepository();
const service = new SosParticipantService(repository);
const controller = new SosParticipantController(service);

/**
 * Join a SOS
 * POST /api/sos/:sosId/participants/join
 */
router.post('/join', (req, res, next) =>
  controller.joinSos(req, res).catch(next),
);

/**
 * Leave a SOS
 * PATCH /api/sos/:sosId/participants/:userId/leave
 */
router.patch('/:userId/leave', (req, res, next) =>
  controller.leaveSos(req, res).catch(next),
);

/**
 * Get active participants
 * GET /api/sos/:sosId/participants/active
 */
router.get('/active', (req, res, next) =>
  controller.getActiveParticipants(req, res).catch(next),
);

/**
 * Get participant history
 * GET /api/sos/:sosId/participants/history
 */
router.get('/history', (req, res, next) =>
  controller.getParticipantHistory(req, res).catch(next),
);

/**
 * Check if user is active participant
 * GET /api/sos/:sosId/participants/:userId/check
 */
router.get('/:userId/check', (req, res, next) =>
  controller.checkActiveParticipation(req, res).catch(next),
);

/**
 * Get user's participation history
 * GET /api/sos/:sosId/participants/user/:userId/history
 */
router.get('/user/:userId/history', (req, res, next) =>
  controller.getUserParticipationHistory(req, res).catch(next),
);

export default router;
