import { Router } from 'express';
import { ReverseGeocodingController } from './reverse-geocoding.controller';

const router = Router();
const controller = new ReverseGeocodingController();

/**
 * GET /geo/reverse-geocode?lat=15.0339584&lon=120.6878208
 * Reverse geocode coordinates to address
 * Optional: zoom=18, addressDetails=true
 */
router.get('/', (req, res) =>
  controller.reverseGeocode(req, res)
);

/**
 * DELETE /geo/reverse-geocode/cache?lat=15.0339584&lon=120.6878208
 * Clear cache for specific coordinates
 */
router.delete('/cache', (req, res) =>
  controller.clearCache(req, res)
);

/**
 * DELETE /geo/reverse-geocode/cache-all
 * Clear all reverse geocoding cache
 */
router.delete('/cache-all', (req, res) =>
  controller.clearAllCache(req, res)
);

export { controller as reverseGeocodingController };
export default router;
