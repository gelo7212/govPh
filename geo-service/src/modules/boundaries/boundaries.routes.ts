import { Router } from 'express';
import { BoundariesController } from './boundaries.controller';

const router = Router();
const controller = new BoundariesController();

/**
 * GET /geo/boundaries/provinces
 * Get all provinces
 */
router.get('/provinces', (req, res) =>
  controller.getAllProvinces(req, res)
);

/**
 * GET /geo/boundaries/municipalities?provinceCode=0301400000
 * Get municipalities by province code
 */
router.get('/municipalities', (req, res) =>
  controller.getMunicipalitiesByProvince(req, res)
);

/**
 * GET /geo/boundaries/barangays?municipalityCode=030140001
 * Get barangays by municipality code
 */
router.get('/barangays', (req, res) =>
  controller.getBarangaysByMunicipality(req, res)
);

export default router;
