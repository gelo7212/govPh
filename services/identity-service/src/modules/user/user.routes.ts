import { Router } from 'express';
import { userController } from './user.controller';
import { requireAuth, requireRole, requireCityAdmin } from '../../middleware/requireRole';

const router = Router();

/**
 * User Routes
 * Core user management endpoints
 */

/**
 * POST /users/register
 * Citizen self-registration
 */
router.post(
  '/register',
  requireAuth(),
  (req, res, next) =>
    userController.registerCitizen(req, res).catch(next)
);

/**
 * GET /users/me
 * Get current user profile
 */
router.get(
  '/me',
  requireAuth(),
  (req, res, next) =>
    userController.getProfile(req, res).catch(next)
);

/**
 * PATCH /users/status
 * Update user registration status (admin only)
 */
router.patch(
  '/status',
  requireCityAdmin(),
  (req, res, next) =>
    userController.updateUserStatus(req, res).catch(next)
);

export default router;
