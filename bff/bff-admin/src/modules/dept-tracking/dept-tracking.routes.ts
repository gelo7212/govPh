import { Router } from 'express';
import { deptTrackingController } from './dept-tracking.controller';
import { preventActor, requireActor } from '../../middlewares/requireActor';
import { requireRole } from '../../middlewares/requireRole';
import { authContextMiddleware } from '../../middlewares/authContext';

const router = Router();

/**
 * Share Link Routes
 * Handles shareable link creation, validation, and management
 * Base path: /api/sharelink
 */

/**
 * @route POST /api/sharelink/
 * @desc Create a shareable link for incident/assignment
 * @access Private (CITY_ADMIN, SOS_ADMIN)
 */
router.post(
  '/',
  authContextMiddleware,
  requireRole('CITY_ADMIN'),
  preventActor('ANON', 'SHARE_LINK'),
  (req, res) => deptTrackingController.createShareableLink(req, res)
);

/**
 * @route GET /api/sharelink/validate/:hashToken
 * @desc Validate a shareable link
 * @access Public
 */
router.get('/validate/:hashToken', (req, res) =>
  deptTrackingController.validateShareableLink(req, res)
);

/**
 * @route DELETE /api/sharelink/revoke/:hashToken
 * @desc Revoke a shareable link
 * @access Private (CITY_ADMIN, SOS_ADMIN)
 */
router.delete(
    '/revoke/:hashToken',
    authContextMiddleware,
    requireRole('CITY_ADMIN'),
    preventActor('ANON', 'SHARE_LINK'),
    (req, res) => deptTrackingController.revokeShareableLink(req, res)
);

/**
 * @route GET /api/sharelink/department/:departmentId
 * @desc Get active shareable links for a department
 * @access Private (CITY_ADMIN, SOS_ADMIN)
 */
router.get(
    '/department/:departmentId',
    authContextMiddleware,
    requireRole('CITY_ADMIN'),
    preventActor('ANON', 'SHARE_LINK'),
    (req, res) => deptTrackingController.getActiveLinksByDepartment(req, res)
);

export default router;