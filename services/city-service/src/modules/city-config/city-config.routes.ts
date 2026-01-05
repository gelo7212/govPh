import { Router } from 'express';
import { cityConfigController } from './index';

const router = Router();

/**
 * City Config Routes
 * Manage city-specific business rules and settings
 */

/**
 * GET /city-configs
 * List all city configurations with optional filtering
 */
router.get(
  '/',
  (req, res, next) =>
    cityConfigController.getAll(req, res).catch(next),
);

/**
 * GET /city-configs/:cityCode
 * Get city configuration by city code
 */
router.get(
  '/:cityCode',
  (req, res, next) =>
    cityConfigController.getByCity(req, res).catch(next),
);

/**
 * POST /city-configs
 * Create a new city configuration
 */
router.post(
  '/',
  (req, res, next) =>
    cityConfigController.create(req, res).catch(next),
);

/**
 * PUT /city-configs/:cityCode
 * Update city configuration
 */
router.put(
  '/:cityCode',
  (req, res, next) =>
    cityConfigController.update(req, res).catch(next),
);

/**
 * DELETE /city-configs/:cityCode
 * Delete city configuration
 */
router.delete(
  '/:cityCode',
  (req, res, next) =>
    cityConfigController.delete(req, res).catch(next),
);

/**
 * PATCH /city-configs/:cityCode/incident-rules
 * Update incident-specific rules
 */
router.patch(
  '/:cityCode/incident-rules',
  (req, res, next) =>
    cityConfigController.updateIncidentRules(req, res).catch(next),
);

/**
 * PATCH /city-configs/:cityCode/sos-rules
 * Update SOS-specific rules
 */
router.patch(
  '/:cityCode/sos-rules',
  (req, res, next) =>
    cityConfigController.updateSosRules(req, res).catch(next),
);

/**
 * PATCH /city-configs/:cityCode/visibility-rules
 * Update visibility and transparency rules
 */
router.patch(
  '/:cityCode/visibility-rules',
  (req, res, next) =>
    cityConfigController.updateVisibilityRules(req, res).catch(next),
);

/**
 * POST /city-configs/:cityCode/setup/initialize
 * Initialize setup workflow for a city
 */
router.post(
  '/:cityCode/setup/initialize',
  (req, res, next) =>
    cityConfigController.initializeSetup(req, res).catch(next),
);

/**
 * PATCH /city-configs/:cityCode/setup/step
 * Update current setup step
 */
router.patch(
  '/:cityCode/setup/step',
  (req, res, next) =>
    cityConfigController.updateSetupStep(req, res).catch(next),
);

/**
 * GET /city-configs/:cityCode/setup/status
 * Get current setup status
 */
router.get(
  '/:cityCode/setup/status',
  (req, res, next) =>
    cityConfigController.getSetupStatus(req, res).catch(next),
);

export default router;
