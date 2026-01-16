import { Router } from 'express';
import { evacuationCenterController } from './index';

const router = Router();

/**
 * Evacuation Center Routes
 * Emergency evacuation center management
 */

/**
 * GET /evacuation-centers
 * List all evacuation centers with optional filtering
 */
router.get(
  '/',
  (req, res, next) =>
    evacuationCenterController.getAll(req, res).catch(next),
);

/**
 * GET /evacuation-centers/:id
 * Get evacuation center details by ID
 */
router.get(
  '/:id',
  (req, res, next) =>
    evacuationCenterController.getById(req, res).catch(next),
);

/**
 * POST /evacuation-centers
 * Create a new evacuation center
 */
router.post(
  '/',
  (req, res, next) =>
    evacuationCenterController.create(req, res).catch(next),
);

/**
 * PUT /evacuation-centers/:id
 * Update evacuation center information
 */
router.put(
  '/:id',
  (req, res, next) =>
    evacuationCenterController.update(req, res).catch(next),
);

/**
 * DELETE /evacuation-centers/:id
 * Delete evacuation center
 */
router.delete(
  '/:id',
  (req, res, next) =>
    evacuationCenterController.delete(req, res).catch(next),
);

/**
 * PATCH /evacuation-centers/:id/status
 * Update evacuation center status
 */
router.patch(
  '/:id/status',
  (req, res, next) =>
    evacuationCenterController.updateStatus(req, res).catch(next),
);

/**
 * PATCH /evacuation-centers/:id/capacity
 * Update evacuation center capacity
 */
router.patch(
  '/:id/capacity',
  (req, res, next) =>
    evacuationCenterController.updateCapacity(req, res).catch(next),
);

export default router;
