import { Router } from 'express';
import { IdentityController } from './identity.controller';
import { IdentityAggregator } from './identity.aggregator';
import { GeoAggregator, GeoServiceClient, IdentityServiceClient, SosAggregator, SosServiceClient } from '@gov-ph/bff-core';
import { authContextMiddleware } from '../../middlewares/authContext';

export const identityRoutes = Router();


// Initialize dependencies
const sosClient = new SosServiceClient(process.env.SOS_SERVICE_URL || 'http://govph-sos:3000');
const sosAggregator = new SosAggregator(sosClient);
const geoClient = new GeoServiceClient(process.env.GEO_SERVICE_URL || 'http://govph-geo:3000');
const geoAggregator = new GeoAggregator(geoClient);

const identityClient = new IdentityServiceClient(process.env.IDENTITY_SERVICE_URL || 'http://govph-identity:3000');
const identityAggregator = new IdentityAggregator(identityClient);
const identityController = new IdentityController(identityAggregator, geoAggregator, sosAggregator);


// Routes
identityRoutes.post('/token', (req, res) => identityController.getToken(req, res));
identityRoutes.get('/profile',authContextMiddleware, (req, res) => identityController.getProfile(req, res));
identityRoutes.post('/logout',authContextMiddleware, (req, res) => identityController.logout(req, res));
identityRoutes.get('/firebase/:firebaseUid',authContextMiddleware, (req, res) => identityController.getFirebaseAccount(req, res));
identityRoutes.post('/register', (req, res) => identityController.registerCitizen(req, res));
identityRoutes.post('/refresh',authContextMiddleware, (req, res) => identityController.refreshToken(req, res));
identityRoutes.post('/validate',authContextMiddleware, (req, res) => identityController.validateToken(req, res));
identityRoutes.get('/user/:userId',authContextMiddleware, (req, res) => identityController.getUserDetails(req, res));
identityRoutes.post('/admin/register', (req, res) => identityController.registerAdmin(req, res));