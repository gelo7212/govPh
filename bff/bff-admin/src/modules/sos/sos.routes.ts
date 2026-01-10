import { Router, Request, Response } from 'express';
import { SosController } from './sos.controller';
import { SosAggregator } from './sos.aggregator';
import { MessageController } from './sos.message.controller';
import { MessageAggregator } from './sos.message.aggregator';
import { SosServiceClient, UserContext } from '@gov-ph/bff-core';
import { validate, createSOSSchema, updateLocationSchema, sendMessageSchema } from '../../utils/validators';
import { authContextMiddleware } from '../../middlewares/authContext';
import { requireActor } from '../../middlewares/requireActor';
import createSosParticipantsRoutes from './sos.participants.routes';

export const sosRoutes = Router();


// ==================== CORS Preflight Handlers ====================
sosRoutes.options('/', (req, res) => res.sendStatus(200));
sosRoutes.options('/:sosId', (req, res) => res.sendStatus(200));
sosRoutes.options('/user/requests', (req, res) => res.sendStatus(200));
sosRoutes.options('/citizen/active', (req, res) => res.sendStatus(200));
sosRoutes.options('/:sosId/tag', (req, res) => res.sendStatus(200));
sosRoutes.options('/:sosId/messages', (req, res) => res.sendStatus(200));

// ==================== SOS Routes ====================

// Initialize SOS dependencies
const sosClient = new SosServiceClient(process.env.SOS_SERVICE_URL || 'http://govph-sos:3000');
const sosAggregator = new SosAggregator(sosClient);
const sosController = new SosController(sosAggregator);

const messageAggregator = new MessageAggregator(sosClient);
const messageController = new MessageController(messageAggregator);

// Routes
sosRoutes.get('/:sosId',authContextMiddleware, requireActor('USER','ANON'), (req, res) => sosController.getSosRequest(req, res));
sosRoutes.get('/user/requests',authContextMiddleware, requireActor('USER'), (req, res) => sosController.getUserSosRequests(req, res));
sosRoutes.get('/citizen/active',authContextMiddleware, requireActor('USER'), (req, res) => sosController.getActiveSosByCitizen(req, res));
sosRoutes.put('/:sosId/tag',authContextMiddleware, requireActor('USER'), (req, res) => sosController.updateSosTag(req, res));
sosRoutes.post('/:sosId/close',authContextMiddleware,requireActor('USER'), (req, res) => sosController.closeSosRequest(req, res));
sosRoutes.get('/states/nearby',authContextMiddleware,requireActor('USER'), (req: Request, res: Response) => sosController.getNearbySOSStates(req, res)); 
sosRoutes.get('/:sosId/state',authContextMiddleware,requireActor('USER','ANON'), (req: Request, res: Response) => sosController.getSosState(req, res));
sosRoutes.post('/:sosId/anon-rescuer',authContextMiddleware,requireActor('USER'), (req: Request, res: Response) => sosController.createAnonRescuer(req, res));


// dispatch 
sosRoutes.post('/:sosId/dispatch/rescue',authContextMiddleware, requireActor('USER'), (req, res) => sosController.dispatchRescue(req, res));


// Rescuer Routes

sosRoutes.get('/rescuer/assignment',authContextMiddleware, requireActor('USER'), (req, res) => sosController.getRescuerAssignment(req, res));
sosRoutes.post('/rescuer/location',authContextMiddleware, requireActor('USER','ANON'), validate(updateLocationSchema), (req, res) => sosController.updateRescuerLocation(req, res));
sosRoutes.get('/rescuer/location',authContextMiddleware, requireActor('USER','ANON'), (req, res) => sosController.getRescuerLocation(req, res));
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



// Participant Routes - nested under SOS
const participantsRoutes = createSosParticipantsRoutes();
sosRoutes.use('/:sosId/participants', participantsRoutes);
