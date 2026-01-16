import { Router } from 'express';
import { EvacuationCenterController } from './evacuation.controller';
import { AdminEvacuationCenterAggregator } from './evacuation.aggregator';
import { authContextMiddleware } from '../../middlewares/authContext';
const router = Router();

// Initialize dependencies
const evacuationCenterAggregator = new AdminEvacuationCenterAggregator(
  process.env.CITY_SERVICE_URL || 'http://govph-city:3000',
);
const evacuationCenterController = new EvacuationCenterController(evacuationCenterAggregator);

// ==================== Evacuation Centers ====================

router.use(authContextMiddleware);

/**
 * GET /api/evacuation-centers
 * Get all evacuation centers
 */
router.get(
  '/',
  (req, res) => evacuationCenterController.getAllEvacuationCenters(req, res),
);




// ==================== City-specific routes (must be before :id routes) ====================

/**
 * GET /api/evacuation-centers/by-city?cityId=city-001
 * Get evacuation centers for a city
 */
router.get(
  '/by-city',
  (req, res) => evacuationCenterController.getEvacuationCentersByCity(req, res),
);

/**
 * GET /api/evacuation-centers/open?cityId=city-001
 * Get open evacuation centers for a city
 */
router.get(
  '/open',
  (req, res) => evacuationCenterController.getOpenEvacuationCentersByCity(req, res),
);

/**
 * GET /api/evacuation-centers/available?cityId=city-001
 * Get available evacuation centers for a city
 */
router.get(
  '/available',
  (req, res) => evacuationCenterController.getAvailableEvacuationCentersByCity(req, res),
);

// ==================== Dynamic :id routes ====================

/**
 * GET /api/evacuation-centers/:id/capacity
 * Get available capacity for an evacuation center
 */
router.get(
  '/:id/capacity',
  (req, res) => evacuationCenterController.getAvailableCapacity(req, res),
);



/**
 * GET /api/evacuation-centers/:id
 * Get evacuation center by ID
 */
router.get(
  '/:id',
  (req, res) => evacuationCenterController.getEvacuationCenterById(req, res),
);

export { router as evacuationRoutes };
