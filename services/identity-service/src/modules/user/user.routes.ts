import { Router } from 'express';
import { userController } from './user.controller';
import { requireAuth, requireRole, requireCityAdmin } from '../../middleware/requireRole';
import { authMiddleware } from '../auth';

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
  (req, res, next) =>
    userController.registerCitizen(req, res).catch(next)
);

router.get(
  '/:userId',
  (req, res, next) =>
    userController.getUserById(req, res).catch(next)
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

/**
 * GET /users/firebase/:firebaseUid
 * Get user by Firebase UID
 */
router.get(
  '/firebase/:firebaseUid',
  // requireAuth(),
  (req, res, next) =>
    userController.getUserByFirebaseUid(req, res).catch(next)
);

/**
 * GET 
 * Check if firebase UID is already registered
 */
router.get( 
  '/exists/:firebaseUid',
  // requireAuth(),
  (req, res, next) =>
    userController.checkFirebaseUidExists(req, res).catch(next)
);

export default router;
