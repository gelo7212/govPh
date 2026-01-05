import { Router } from 'express';
import { inviteController } from './invite.controller';
import { requireCityAdmin } from '../../middlewares/requireRole';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

/**
 * Invite Routes
 * Admin invitation flow for role assignment
 */

/**
 * POST /invites
 * Create a new invite
 * Allowed: APP_ADMIN, CITY_ADMIN
 */
router.post(
  '/',
  authMiddleware,
  requireCityAdmin(),
  (req, res, next) =>
    inviteController.createInvite(req, res).catch(next)
);

/**
 * GET /invites/:inviteId
 * Validate invite (check status)
 * Public endpoint - no auth required
 */
router.get(
  '/:inviteId',
  (req, res, next) =>
    inviteController.validateInvite(req, res).catch(next)
);

/**
 * POST /invites/:inviteId/accept
 * Accept invite with 6-digit code
 * Requires authentication
 */
router.post(
  '/:inviteId/accept',
  authMiddleware,
  (req, res, next) =>
    inviteController.acceptInvite(req, res).catch(next)
);

/**
 * GET /invites
 * List invites (admin dashboard)
 * Allowed: APP_ADMIN, CITY_ADMIN
 */
router.get(
  '/',
  authMiddleware,
  requireCityAdmin(),
  (req, res, next) =>
    inviteController.listInvites(req, res).catch(next)
);

export default router;
