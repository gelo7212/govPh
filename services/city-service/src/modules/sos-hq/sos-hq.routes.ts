import { Router } from 'express';
import { sosHQController } from './index';

const router = Router();

/**
 * SOS Headquarters Routes
 * Physical dispatch points management (city/province level)
 */

/**
 * GET /sos-hq
 * List all SOS headquarters with optional filtering
 */
router.get(
  '/',
  (req, res, next) =>
    sosHQController.getAll(req, res).catch(next),
);

/**
 * GET /sos-hq/:id
 * Get SOS HQ details by ID
 */
router.get(
  '/:id',
  (req, res, next) =>
    sosHQController.getById(req, res).catch(next),
);

/**
 * POST /sos-hq
 * Create a new SOS headquarters
 */
router.post(
  '/',
  (req, res, next) =>
    sosHQController.create(req, res).catch(next),
);

/**
 * PUT /sos-hq/:id
 * Update SOS headquarters information
 */
router.put(
  '/:id',
  (req, res, next) =>
    sosHQController.update(req, res).catch(next),
);

/**
 * DELETE /sos-hq/:id
 * Delete a SOS headquarters
 */
router.delete(
  '/:id',
  (req, res, next) =>
    sosHQController.delete(req, res).catch(next),
);

/**
 * POST /sos-hq/:id/activate
 * Activate a SOS headquarters
 */
router.patch(
  '/:id/activate',
  (req, res, next) =>
    sosHQController.activate(req, res).catch(next),
);

/**
 * POST /sos-hq/:id/deactivate
 * Deactivate a SOS headquarters
 */
router.post(
  '/:id/deactivate',
  (req, res, next) =>
    sosHQController.deactivate(req, res).catch(next),
);

export default router;
