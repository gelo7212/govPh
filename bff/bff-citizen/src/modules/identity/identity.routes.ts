import { Router } from 'express';
import { IdentityController } from './identity.controller';
import { IdentityAggregator } from './identity.aggregator';
import { IdentityServiceClient } from '@gov-ph/bff-core';

export const identityRoutes = Router();

// Initialize dependencies
const identityClient = new IdentityServiceClient(process.env.IDENTITY_SERVICE_URL || 'http://identity-service:3000');
const identityAggregator = new IdentityAggregator(identityClient);
const identityController = new IdentityController(identityAggregator);

// Routes
identityRoutes.post('/token', (req, res) => identityController.getToken(req, res));
identityRoutes.get('/profile', (req, res) => identityController.getProfile(req, res));
identityRoutes.post('/logout', (req, res) => identityController.logout(req, res));
identityRoutes.get('/firebase/:firebaseUid', (req, res) => identityController.getFirebaseAccount(req, res));
identityRoutes.post('/register', (req, res) => identityController.registerCitizen(req, res));