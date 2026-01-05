import { Router } from 'express';
import { GeoController } from './geo.controller';
import { GeoAggregator } from './geo.aggregator';
import { GeoServiceClient } from '@gov-ph/bff-core';
import { authContextMiddleware } from '../../middlewares/authContext';

export const geoRoutes = Router();

// Initialize dependencies
const geoClient = new GeoServiceClient(process.env.GEO_SERVICE_URL || 'http://govph-geo:3000');
const geoAggregator = new GeoAggregator(geoClient);
const geoController = new GeoController(geoAggregator);

// Routes
/**
 * GET /geo/provinces
 * Get all provinces
 */
geoRoutes.get('/provinces',  (req, res) => geoController.getAllProvinces(req, res));

/**
 * GET /geo/municipalities?province=<province_name>
 * Get municipalities by province name
 */
geoRoutes.get('/municipalities', (req, res) => geoController.getMunicipalitiesByProvince(req, res));

/**
 * GET /geo/barangays?municipalityCode=<code>
 * Get barangays by municipality code
 */
geoRoutes.get('/barangays', (req, res) => geoController.getBarangaysByMunicipality(req, res));

/**
 * GET /geo/reverse-geocode?lat=15.0339584&lon=120.6878208
 * Reverse geocode coordinates to address
 * Optional: zoom=18, addressDetails=true
 */
geoRoutes.get('/reverse-geocode',authContextMiddleware,  (req, res) => geoController.reverseGeocode(req, res));