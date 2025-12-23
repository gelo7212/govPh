import { Router } from 'express';
import { SosController } from './sos.controller';
import { SosAggregator } from './sos.aggregator';
import { SosServiceClient } from '@gov-ph/bff-core';

export const sosRoutes = Router();

// Initialize dependencies
const sosClient = new SosServiceClient(process.env.SOS_SERVICE_URL || 'http://localhost:3003');
const sosAggregator = new SosAggregator(sosClient);
const sosController = new SosController(sosAggregator);

// Routes
sosRoutes.post('/', (req, res) => sosController.createSosRequest(req, res));
sosRoutes.get('/:sosId', (req, res) => sosController.getSosRequest(req, res));
sosRoutes.get('/user/requests', (req, res) => sosController.getUserSosRequests(req, res));
sosRoutes.delete('/:sosId', (req, res) => sosController.cancelSosRequest(req, res));
