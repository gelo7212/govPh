import { Router } from 'express';
import { cityController } from './index';

const router = Router();

/**
 * City Routes
 * LGU identity and operational reference management
 */

/**
 * GET /cities
 * List all cities with optional filtering
 */
router.get(
  '/',
  (req, res, next) =>
    cityController.getAll(req, res).catch(next),
);

/**
 * GET /cities/:cityCode
 * Get city details by city code
 */
router.get(
  '/:cityCode',
  (req, res, next) =>
    cityController.getByCode(req, res).catch(next),
);

/**
 * POST /cities
 * Create a new city
 */
router.post(
  '/',
  (req, res, next) =>
    cityController.create(req, res).catch(next),
);

/**
 * PUT /cities/:cityCode
 * Update city information
 */
router.put(
  '/:cityCode',
  (req, res, next) =>
    cityController.update(req, res).catch(next),
);

/**
 * DELETE /cities/:cityCode
 * Delete a city
 */
router.delete(
  '/:cityCode',
  (req, res, next) =>
    cityController.delete(req, res).catch(next),
);

export default router;
