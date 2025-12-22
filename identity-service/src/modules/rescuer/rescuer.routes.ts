import { Router } from 'express';
import { rescuerController } from './rescuer.controller';
import { requireSOSAdmin } from '../../middleware/requireRole';

const router = Router();

/**
 * Rescuer Routes
 * Mission-based rescuer access endpoints
 * Rescuers are NOT users - they receive temporary mission tokens
 */

/**
 * POST /rescuer/mission
 * Create a new rescuer mission for a SOS
 * Allowed: city_admin, sos_admin
 */
router.post(
  '/mission',
  requireSOSAdmin(),
  (req, res, next) =>
    rescuerController.createMission(req, res).catch(next)
);

/**
 * GET /rescuer/mission/verify
 * Verify a rescuer mission token
 * Public endpoint - no auth required (token-based validation)
 */
router.get(
  '/mission/verify',
  (req, res, next) =>
    rescuerController.verifyMission(req, res).catch(next)
);

/**
 * POST /rescuer/mission/revoke
 * Revoke a rescuer mission
 * Allowed: city_admin, sos_admin
 */
router.post(
  '/mission/revoke',
  requireSOSAdmin(),
  (req, res, next) =>
    rescuerController.revokeMission(req, res).catch(next)
);

export default router;
