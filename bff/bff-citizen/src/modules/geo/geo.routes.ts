import { Router } from 'express';
import { GeoController } from './geo.controller';
import { GeoAggregator } from './geo.aggregator';
import { GeoServiceClient } from '@gov-ph/bff-core';

export const geoRoutes = Router();

// Initialize dependencies
const geoClient = new GeoServiceClient(process.env.GEO_SERVICE_URL || 'http://geo-service:3000');
const geoAggregator = new GeoAggregator(geoClient);
const geoController = new GeoController(geoAggregator);

// Routes
/**
 * GET /geo/provinces
 * Get all provinces
 */
geoRoutes.get('/provinces', (req, res) => geoController.getAllProvinces(req, res));

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
