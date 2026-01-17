import { Router } from 'express';
import { ServiceController } from './service.controller';
import { AdminServiceAggregator } from './service.aggregator';
import { authContextMiddleware } from '../../middlewares/authContext';
import { requireRole } from '../../middlewares/requireRole';
import { preventActor } from '../../middlewares/requireActor';

const router = Router();

// Initialize dependencies
const serviceAggregator = new AdminServiceAggregator(
  process.env.CITY_SERVICE_URL || 'http://govph-city:3000'
);
const serviceController = new ServiceController(serviceAggregator);

// Apply middlewares
router.use(authContextMiddleware, preventActor('ANON', 'SHARE_LINK'));

// ==================== Service Endpoints ====================

/**
 * GET /api/admin/services
 * Get all services globally
 */
router.get(
  '/',
  requireRole('APP_ADMIN'),
  (req, res) => serviceController.getAllServices(req, res),
);

/**
 * POST /api/admin/services
 * Create a new service
 */
router.post(
  '/',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.createService(req, res),
);

/**
 * GET /api/admin/services/:serviceId
 * Get service by ID
 */
router.get(
  '/:serviceId',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.getServiceById(req, res),
);

/**
 * PUT /api/admin/services/:serviceId
 * Update service
 */
router.put(
  '/:serviceId',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.updateService(req, res),
);

/**
 * DELETE /api/admin/services/:serviceId
 * Delete service
 */
router.delete(
  '/:serviceId',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.deleteService(req, res),
);

/**
 * PATCH /api/admin/services/:serviceId/archive
 * Archive service
 */
router.patch(
  '/:serviceId/archive',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.archiveService(req, res),
);

/**
 * PATCH /api/admin/services/:serviceId/activate
 * Activate archived service
 */
router.patch(
  '/:serviceId/activate',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.activateService(req, res),
);

/**
 * PATCH /api/admin/services/:serviceId/info-form
 * Update info form
 */
router.patch(
  '/:serviceId/info-form',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.updateInfoForm(req, res),
);

/**
 * PATCH /api/admin/services/:serviceId/application-form
 * Update application form
 */
router.patch(
  '/:serviceId/application-form',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.updateApplicationForm(req, res),
);

/**
 * PATCH /api/admin/services/:serviceId/availability
 * Update service availability
 */
router.patch(
  '/:serviceId/availability',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.updateAvailability(req, res),
);

// ==================== City-specific Service Endpoints ====================

/**
 * GET /api/admin/services/city/:cityId/services
 * http://admin.localhost/api/admin/services/city/694d84150a920a9adffab81f?limit=100
 * Get all services for a city
 */
router.get(
  '/city/:cityId',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.getServicesByCity(req, res),
);

/**
 * GET /api/admin/services/city/:cityId/services/category/:category
 * Get services by category in a city
 */
router.get(
  '/city/:cityId/category/:category',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.getServicesByCategory(req, res),
);

/**
 * GET /api/admin/services/city/:cityId/services/count
 * Get count of services in a city
 */
router.get(
  '/city/:cityId/count',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => serviceController.countServicesByCity(req, res),
);

export default router;
