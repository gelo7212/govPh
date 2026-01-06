import { Router, Request, Response } from 'express';
import { SosController } from './sos.controller';
import { SosAggregator } from './sos.aggregator';
import { MessageController } from './sos.message.controller';
import { MessageAggregator } from './sos.message.aggregator';
import { CityServiceClient, RealtimeServiceClient, SosServiceClient, UserContext } from '@gov-ph/bff-core';
import { validate, createSOSSchema, updateLocationSchema, sendMessageSchema } from '../../utils/validators';
import { authContextMiddleware } from '../../middlewares/authContext';
import createSosParticipantsRoutes from './sos.participants.routes';

export const sosRoutes = Router();


// ==================== CORS Preflight Handlers ====================
sosRoutes.options('/', (req, res) => res.sendStatus(200));
sosRoutes.options('/:sosId', (req, res) => res.sendStatus(200));
sosRoutes.options('/user/requests', (req, res) => res.sendStatus(200));
sosRoutes.options('/citizen/active', (req, res) => res.sendStatus(200));
sosRoutes.options('/:sosId/tag', (req, res) => res.sendStatus(200));
sosRoutes.options('/:sosId/messages', (req, res) => res.sendStatus(200));

// Initialize SOS dependencies
const realtimeServiceUrl = process.env.REALTIME_SERVICE_URL || 'http://govph-realtime:3000';
const realtimeClient = new RealtimeServiceClient(realtimeServiceUrl);
const sosClient = new SosServiceClient(process.env.SOS_SERVICE_URL || 'http://govph-sos:3000');
const cityServiceUrl = process.env.CITY_SERVICE_URL || 'http://govph-city:3000';
const cityServiceClient = new CityServiceClient(cityServiceUrl);
const sosAggregator = new SosAggregator(sosClient, realtimeClient, cityServiceClient);
const sosController = new SosController(sosAggregator);

const messageAggregator = new MessageAggregator(sosClient);
const messageController = new MessageController(messageAggregator);

// Routes
sosRoutes.post('/',authContextMiddleware, validate(createSOSSchema), (req, res) => sosController.createSosRequest(req, res));
sosRoutes.get('/:sosId',authContextMiddleware, (req, res) => sosController.getSosRequest(req, res));
sosRoutes.get('/user/requests',authContextMiddleware, (req, res) => sosController.getUserSosRequests(req, res));
sosRoutes.get('/citizen/active',authContextMiddleware, (req, res) => sosController.getActiveSosByCitizen(req, res));
sosRoutes.put('/:sosId/tag',authContextMiddleware, (req, res) => sosController.updateSosTag(req, res));
sosRoutes.post('/:sosId/cancel',authContextMiddleware, (req, res) => sosController.cancelSosRequest(req, res));

// Message Routes - nested under SOS
/**
 * Send a message to an SOS conversation
 * POST /:sosId/messages
 */
sosRoutes.post('/:sosId/messages',authContextMiddleware, (req, res) => messageController.sendMessage(req, res));

/**
 * Get all messages for an SOS conversation
 * GET /:sosId/messages
 */
sosRoutes.get('/:sosId/messages',authContextMiddleware, (req, res) => messageController.getMessages(req, res));

/**
 * Get a single message by ID
 * GET /message/:messageId
 */
sosRoutes.get('/message/:messageId',authContextMiddleware, (req, res) => messageController.getMessage(req, res));

/**
 * Get nearby SOS HQs based on coordinates
 * GET /sos/nearest/location?lat={latitude}&lng={longitude}
*/
sosRoutes.get(
  '/nearest/location',
  authContextMiddleware,
  (req: Request, res: Response) => sosController.getNearestSosHQ(req, res),
);

// Participant Routes - nested under SOS
const participantsRoutes = createSosParticipantsRoutes();
sosRoutes.use('/:sosId/participants', participantsRoutes);