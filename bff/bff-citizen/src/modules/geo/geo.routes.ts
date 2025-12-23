import { Router } from 'express';
import { GeoController } from './geo.controller';
import { GeoAggregator } from './geo.aggregator';
import { GeoServiceClient } from '@gov-ph/bff-core';

export const geoRoutes = Router();

// Initialize dependencies
const geoClient = new GeoServiceClient(process.env.GEO_SERVICE_URL || 'http://localhost:3004');
const geoAggregator = new GeoAggregator(geoClient);
const geoController = new GeoController(geoAggregator);

// Routes
geoRoutes.get('/boundaries', (req, res) => geoController.getBoundaries(req, res));
geoRoutes.get('/boundaries/:boundaryId', (req, res) => geoController.getBoundaryById(req, res));
geoRoutes.get('/search', (req, res) => geoController.searchBoundaries(req, res));
