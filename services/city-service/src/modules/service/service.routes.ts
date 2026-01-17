import { Router } from 'express';
import { serviceController } from './index';

const router = Router();

/**
 * Service Routes
 * Manage city services (health, education, employment, etc.)
 */

/**
 * GET /services
 * List all services with optional filtering
 */
router.get(
  '/',
  (req, res, next) =>
    serviceController.getAll(req, res).catch(next),
);

/**
 * GET /services/city/:cityId
 * Get all services for a specific city
 */
router.get(
  '/city/:cityId',
  (req, res, next) =>
    serviceController.getByCity(req, res).catch(next),
);

/**
 * GET /services/:serviceId
 * Get service by ID
 */
router.get(
  '/:serviceId',
  (req, res, next) =>
    serviceController.getById(req, res).catch(next),
);

/**
 * POST /services
 * Create a new service
 */
router.post(
  '/',
  (req, res, next) =>
    serviceController.create(req, res).catch(next),
);

/**
 * PUT /services/:serviceId
 * Update service
 */
router.put(
  '/:serviceId',
  (req, res, next) =>
    serviceController.update(req, res).catch(next),
);

/**
 * DELETE /services/:serviceId
 * Delete service permanently
 */
router.delete(
  '/:serviceId',
  (req, res, next) =>
    serviceController.delete(req, res).catch(next),
);

/**
 * PATCH /services/:serviceId/archive
 * Archive service (set isActive to false)
 */
router.patch(
  '/:serviceId/archive',
  (req, res, next) =>
    serviceController.archive(req, res).catch(next),
);

/**
 * PATCH /services/:serviceId/activate
 * Activate archived service (set isActive to true)
 */
router.patch(
  '/:serviceId/activate',
  (req, res, next) =>
    serviceController.activate(req, res).catch(next),
);

/**
 * PATCH /services/:serviceId/info-form
 * Update info form for service
 */
router.patch(
  '/:serviceId/info-form',
  (req, res, next) =>
    serviceController.updateInfoForm(req, res).catch(next),
);

/**
 * PATCH /services/:serviceId/application-form
 * Update application form for service
 */
router.patch(
  '/:serviceId/application-form',
  (req, res, next) =>
    serviceController.updateApplicationForm(req, res).catch(next),
);

/**
 * PATCH /services/:serviceId/availability
 * Update service availability window
 */
router.patch(
  '/:serviceId/availability',
  (req, res, next) =>
    serviceController.updateAvailability(req, res).catch(next),
);

export default router;
