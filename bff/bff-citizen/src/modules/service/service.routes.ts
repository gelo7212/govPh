import { Router } from 'express';
import { ServiceController } from './service.controller';
import { AdminServiceAggregator } from './service.aggregator';
import { authContextMiddleware } from '../../middlewares/authContext';
const router = Router();

// Initialize dependencies
const serviceAggregator = new AdminServiceAggregator(
  process.env.CITY_SERVICE_URL || 'http://govph-city:3000'
);
const serviceController = new ServiceController(serviceAggregator);

// Apply middlewares
router.use(authContextMiddleware);

// ==================== Service Endpoints ====================



/**
 * GET /api/admin/services/:serviceId
 * Get service by ID
 */
router.get(
  '/:serviceId',
  (req, res) => serviceController.getServiceById(req, res),
);

// ==================== City-specific Service Endpoints ====================

/**
 * GET /api/admin/services/city/:cityId/services
 * http://admin.localhost/api/admin/services/city/694d84150a920a9adffab81f?limit=100
 * Get all services for a city
 */
router.get(
  '/city/:cityId',
  (req, res) => serviceController.getServicesByCity(req, res),
);

/**
 * GET /api/admin/services/city/:cityId/services/category/:category
 * Get services by category in a city
 */
router.get(
  '/city/:cityId/category/:category',
  (req, res) => serviceController.getServicesByCategory(req, res),
);


export default router;
