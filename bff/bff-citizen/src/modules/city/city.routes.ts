import { Router } from 'express';
import { CityController } from './city.controller';
import { AdminCityAggregator } from './city.aggregator';
import { authContextMiddleware } from '../../middlewares/authContext';
const router = Router();

// Initialize dependencies
const cityAggregator = new AdminCityAggregator(process.env.CITY_SERVICE_URL || 'http://govph-city:3000');
const cityController = new CityController(cityAggregator);

router.get(
  '/',
  (req, res) => cityController.getAllCities(req, res),
);

router.get(
  '/:cityCode',
  (req, res) => cityController.getCityByCode(req, res),
);

/**
 * GET /api/admin/cities/:cityCode/departments
 * Get departments for a city
 */
router.get(
  '/:cityCode/departments',
  (req, res) => cityController.getDepartmentsByCity(req, res),
);

// ==================== SOS HQ ====================

/**
 * GET /api/admin/cities/:cityCode/sos-hq
 * Get SOS HQ for a city
 */
router.get(
  '/:cityCode/sos-hq',
  (req, res) => cityController.getSosHQByCity(req, res),
);

export { router as cityRoutes };
