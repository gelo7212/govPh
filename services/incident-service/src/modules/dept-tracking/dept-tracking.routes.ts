import { Router } from 'express';
import { deptTrackingController } from './dept-tracking.controller';

const router = Router();

/**
 * @route POST /dept-tracking/create
 * @desc Create a shareable link for department/assignment tracking
 * @access Private
 */
router.post('/create', (req, res) => deptTrackingController.createShareableLink(req, res));

/**
 * @route GET /dept-tracking/validate/:hashToken
 * @desc Validate a shareable link
 * @access Public
 */
router.get('/validate/:token', (req, res) => deptTrackingController.validateShareableLink(req, res));

/**
 * @route DELETE /dept-tracking/revoke/:hashToken
 * @desc Revoke a shareable link
 * @access Private
 */
router.delete('/revoke/:token', (req, res) => deptTrackingController.revokeShareableLink(req, res));

/**
 * @route GET /dept-tracking/department/:departmentId
 * @desc Get active shareable links for a department
 * @access Private
 */
router.get('/department/:departmentId', (req, res) => deptTrackingController.getActiveLinksByDepartment(req, res));

export default router;