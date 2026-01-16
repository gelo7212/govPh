import { Router } from 'express';
import { CityController } from './city.controller';
import { AdminCityAggregator } from './city.aggregator';
import { authContextMiddleware } from '../../middlewares/authContext';
import { requireRole } from '../../middlewares/requireRole';
import { preventActor } from '../../middlewares/requireActor';

const router = Router();

// Initialize dependencies
const cityAggregator = new AdminCityAggregator(process.env.CITY_SERVICE_URL || 'http://govph-city:3000');
const cityController = new CityController(cityAggregator);

// ==================== Cities ====================

router.use(authContextMiddleware, preventActor('ANON','SHARE_LINK'));
/**
 * GET /api/admin/cities
 * Get all cities
 */
router.get(
  '/',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.getAllCities(req, res),
);

/**
 * POST /api/admin/cities
 * Create a new city
 */
router.post(
  '/',
  requireRole('APP_ADMIN','CITY_ADMIN'),
  (req, res) => cityController.createCity(req, res),
);

// ==================== Departments ====================

/**
 * GET /api/admin/cities/:cityCode/departments
 * Get departments for a city
 */
router.get(
  '/:cityCode/departments',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.getDepartmentsByCity(req, res),
);

/**
 * POST /api/admin/cities/:cityCode/departments
 * Create a department for a city
 */
router.post(
  '/:cityCode/departments',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.createDepartment(req, res),
);

/**
 * PUT /api/admin/cities/departments/:id
 * Update department
 */
router.put(
  '/departments/:id',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.updateDepartment(req, res),
);

/**
 * DELETE /api/admin/cities/departments/:id
 * Delete department
 */
router.delete(
  '/departments/:id',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.deleteDepartment(req, res),
);

// ==================== SOS HQ ====================

/**
 * Get /api/admin/cities/sos-hq/user/:userId
*/
router.get(
  '/sos-hq/user/:userId',
  requireRole('APP_ADMIN', 'CITY_ADMIN', 'SOS_ADMIN'),
  (req, res) => cityController.getSosHQByUserId(req, res),
);

/**
 * GET /api/admin/cities/:cityCode/sos-hq
 * Get SOS HQ for a city
 */
router.get(
  '/:cityCode/sos-hq',
  requireRole('APP_ADMIN', 'CITY_ADMIN', 'SOS_ADMIN'),
  (req, res) => cityController.getSosHQByCity(req, res),
);

/**
 * POST /api/admin/cities/:cityCode/sos-hq
 * Create SOS HQ for a city
 */
router.post(
  '/:cityCode/sos-hq',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.createSosHQ(req, res),
);

/**
 * PUT /api/admin/cities/sos-hq/:id
 * Update SOS HQ
 */
router.put(
  '/sos-hq/:id',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.updateSosHQ(req, res),
);

/**
 * GET /api/admin/cities/:cityCode
 * Get city by code
 */
router.get(
  '/:cityCode',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.getCityByCode(req, res),
);

/**
 * PUT /api/admin/cities/:cityCode
 * Update city
 */
router.put(
  '/:cityCode',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.updateCity(req, res),
);

/**
 * DELETE /api/admin/cities/:cityCode
 * Delete city
 */
router.delete(
  '/:cityCode',
  requireRole('APP_ADMIN'),
  (req, res) => cityController.deleteCity(req, res),
);

/**
 * DELETE /api/admin/cities/sos-hq/:id
 * Delete SOS HQ
 */
router.delete(
  '/sos-hq/:id',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.deleteSosHQ(req, res),
);

/**
 * PATCH /api/admin/cities/sos-hq/:id/activate
 * Activate SOS HQ
 */
router.patch(
  '/sos-hq/:id/activate',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.activateSosHQ(req, res),
);

/**
 * PATCH /api/admin/cities/sos-hq/:id/deactivate
 * Deactivate SOS HQ
 */
router.patch(
  '/sos-hq/:id/deactivate',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.deactivateSosHQ(req, res),
);

/** GET /api/admin/cities/sos-hq/:id
 * Get SOS HQ by ID
 */
router.get('/sos-hq/:id',
  requireRole('APP_ADMIN', 'CITY_ADMIN', 'SOS_ADMIN'),
  (req, res) => cityController.getSosHQById(req, res),
);

// ==================== City Config ====================

/**
 * GET /api/admin/cities/:cityCode/config
 * Get city configuration
 */
router.get(
  '/:cityCode/config',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.getCityConfig(req, res),
);

/**
 * PUT /api/admin/cities/:cityCode/config
 * Update city configuration
 */
router.put(
  '/:cityCode/config',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.updateCityConfig(req, res),
);

/**
 * PATCH /api/admin/cities/:cityCode/config/incident-rules
 * Update incident rules
 */
router.patch(
  '/:cityCode/config/incident-rules',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.updateIncidentRules(req, res),
);

/**
 * PATCH /api/admin/cities/:cityCode/config/sos-rules
 * Update SOS rules
 */
router.patch(
  '/:cityCode/config/sos-rules',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.updateSosRules(req, res),
);

/**
 * PATCH /api/admin/cities/:cityCode/config/visibility-rules
 * Update visibility rules
 */
router.patch(
  '/:cityCode/config/visibility-rules',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.updateVisibilityRules(req, res),
);

// ==================== Setup Workflow ====================

/**
 * POST /api/admin/cities/:cityCode/setup/initialize
 * Initialize city setup
 */
router.post(
  '/:cityCode/setup/initialize',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.initializeSetup(req, res),
);

/**
 * PATCH /api/admin/cities/:cityCode/setup/step
 * Update setup step
 */
router.patch(
  '/:cityCode/setup/step',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.updateSetupStep(req, res),
);

/**
 * GET /api/admin/cities/:cityCode/setup/status
 * Get setup status
 */
router.get(
  '/:cityCode/setup/status',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.getSetupStatus(req, res),
);

// ==================== Composite Operations ====================

/**
 * GET /api/admin/cities/:cityCode/complete-setup
 * Get complete city setup
 */
router.get(
  '/:cityCode/complete-setup',
  requireRole('APP_ADMIN', 'CITY_ADMIN'),
  (req, res) => cityController.getCompleteCitySetup(req, res),
);

export { router as cityRoutes };
