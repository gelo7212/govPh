import { Router } from 'express';
import { IdentityController } from './identity.controller';
import { IdentityAggregator } from './identity.aggregator';
import { GeoAggregator, GeoServiceClient, IdentityServiceClient, RealtimeServiceClient, SosAggregator, SosServiceClient } from '@gov-ph/bff-core';
import { authContextForTemporaryAccessMiddleware, authContextMiddleware } from '../../middlewares/authContext';
import { preventActor } from '../../middlewares/requireActor';

export const identityRoutes = Router();


// Initialize dependencies
const realtimeClient = new RealtimeServiceClient(process.env.REALTIME_SERVICE_URL || 'http://govph-realtime:3000');

const sosClient = new SosServiceClient(process.env.SOS_SERVICE_URL || 'http://govph-sos:3000');
const sosAggregator = new SosAggregator(sosClient, realtimeClient);
const geoClient = new GeoServiceClient(process.env.GEO_SERVICE_URL || 'http://govph-geo:3000');
const geoAggregator = new GeoAggregator(geoClient);

const identityClient = new IdentityServiceClient(process.env.IDENTITY_SERVICE_URL || 'http://govph-identity:3000');
const identityAggregator = new IdentityAggregator(identityClient);
const identityController = new IdentityController(identityAggregator, geoAggregator, sosAggregator);


// Routes
identityRoutes.post('/token', (req, res) => identityController.getToken(req, res));
identityRoutes.post('/register', (req, res) => identityController.registerCitizen(req, res));
identityRoutes.post('/admin/register', (req, res) => identityController.registerAdmin(req, res));


identityRoutes.post('/refresh',authContextForTemporaryAccessMiddleware, (req, res) => identityController.refreshToken(req, res));
identityRoutes.use(authContextMiddleware, preventActor('ANON','SHARE_LINK'));
identityRoutes.get('/profile', (req, res) => identityController.getProfile(req, res));
identityRoutes.post('/logout', (req, res) => identityController.logout(req, res));
identityRoutes.post('/validate', (req, res) => identityController.validateToken(req, res));
identityRoutes.get('/user/:userId', (req, res) => identityController.getUserDetails(req, res));
identityRoutes.get('/firebase/:firebaseUid', (req, res) => identityController.getFirebaseAccount(req, res));
identityRoutes.get('/admin/users', (req, res) => identityController.listAdminUsers(req, res));