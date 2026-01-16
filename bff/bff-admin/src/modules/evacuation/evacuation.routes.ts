import { Router } from 'express';
import { EvacuationCenterController } from './evacuation.controller';
import { AdminEvacuationCenterAggregator } from './evacuation.aggregator';
import { authContextMiddleware } from '../../middlewares/authContext';
import { requireRole } from '../../middlewares/requireRole';
import { preventActor } from '../../middlewares/requireActor';

const router = Router();

// Initialize dependencies
const evacuationCenterAggregator = new AdminEvacuationCenterAggregator(
  process.env.CITY_SERVICE_URL || 'http://govph-city:3000',
);
const evacuationCenterController = new EvacuationCenterController(evacuationCenterAggregator);

// ==================== Evacuation Centers ====================

router.use(authContextMiddleware, preventActor('ANON', 'SHARE_LINK'));

/**
 * GET /api/evacuation-centers
 * Get all evacuation centers
 */
router.get(
  '/',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.getAllEvacuationCenters(req, res),
);


/**
 * POST /api/evacuation-centers
 * Create a new evacuation center
 */
router.post(
  '/',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.createEvacuationCenter(req, res),
);

// ==================== City-specific routes (must be before :id routes) ====================

/**
 * GET /api/evacuation-centers/by-city?cityId=city-001
 * Get evacuation centers for a city
 */
router.get(
  '/by-city',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.getEvacuationCentersByCity(req, res),
);

/**
 * GET /api/evacuation-centers/open?cityId=city-001
 * Get open evacuation centers for a city
 */
router.get(
  '/open',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.getOpenEvacuationCentersByCity(req, res),
);

/**
 * GET /api/evacuation-centers/available?cityId=city-001
 * Get available evacuation centers for a city
 */
router.get(
  '/available',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.getAvailableEvacuationCentersByCity(req, res),
);

// ==================== Dynamic :id routes ====================

/**
 * GET /api/evacuation-centers/:id/capacity
 * Get available capacity for an evacuation center
 */
router.get(
  '/:id/capacity',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.getAvailableCapacity(req, res),
);

/**
 * PATCH /api/evacuation-centers/:id/status
 * Update evacuation center status
 */
router.patch(
  '/:id/status',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.updateEvacuationCenterStatus(req, res),
);

/**
 * PATCH /api/evacuation-centers/:id/capacity
 * Update evacuation center capacity
 */
router.patch(
  '/:id/capacity',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.updateEvacuationCenterCapacity(req, res),
);

/**
 * GET /api/evacuation-centers/:id
 * Get evacuation center by ID
 */
router.get(
  '/:id',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.getEvacuationCenterById(req, res),
);

/**
 * PUT /api/evacuation-centers/:id
 * Update evacuation center
 */
router.put(
  '/:id',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.updateEvacuationCenter(req, res),
);

/**
 * DELETE /api/evacuation-centers/:id
 * Delete evacuation center
 */
router.delete(
  '/:id',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => evacuationCenterController.deleteEvacuationCenter(req, res),
);

export { router as evacuationRoutes };
