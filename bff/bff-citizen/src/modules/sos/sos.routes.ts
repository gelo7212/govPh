import { Router, Request, Response } from 'express';
import { SosController } from './sos.controller';
import { SosAggregator } from './sos.aggregator';
import { MessageController } from './sos.message.controller';
import { MessageAggregator } from './sos.message.aggregator';
import { SosServiceClient, UserContext } from '@gov-ph/bff-core';
import { validate, createSOSSchema, updateLocationSchema, sendMessageSchema } from '../../utils/validators';
import { createAttachUserContextMiddleware } from '../../middlewares/attachUserContext';
import { authContextMiddleware } from '../../middlewares/authContext';

export const sosRoutes = Router();

// ==================== CORS Preflight Handlers ====================
sosRoutes.options('/', (req, res) => res.sendStatus(200));
sosRoutes.options('/:sosId', (req, res) => res.sendStatus(200));
sosRoutes.options('/user/requests', (req, res) => res.sendStatus(200));
sosRoutes.options('/citizen/active', (req, res) => res.sendStatus(200));
sosRoutes.options('/:sosId/tag', (req, res) => res.sendStatus(200));
sosRoutes.options('/:sosId/messages', (req, res) => res.sendStatus(200));

// Initialize SOS dependencies
const sosClient = new SosServiceClient(process.env.SOS_SERVICE_URL || 'http://govph-sos:3000');
const sosAggregator = new SosAggregator(sosClient);
const sosController = new SosController(sosAggregator);

const messageAggregator = new MessageAggregator(sosClient);
const messageController = new MessageController(messageAggregator);

/**
 * Middleware to attach user context to service client before each request
 */
const attachUserContext = (req: Request, res: Response, next: Function) => {
  const userContext: UserContext = {
    userId: req.context?.user?.id,
    role: req.context?.user?.role,
    cityId: req.context?.user?.actor?.cityCode,
    requestId: req.context?.requestId,
    actorType: req.context?.user?.actor?.type,
  };
  
  sosClient.setUserContext(userContext);
  next();
};

sosRoutes.use(attachUserContext);

// Routes
sosRoutes.post('/',authContextMiddleware, validate(createSOSSchema), (req, res) => sosController.createSosRequest(req, res));
sosRoutes.get('/:sosId',authContextMiddleware, (req, res) => sosController.getSosRequest(req, res));
sosRoutes.get('/user/requests',authContextMiddleware, (req, res) => sosController.getUserSosRequests(req, res));
sosRoutes.delete('/:sosId',authContextMiddleware, (req, res) => sosController.cancelSosRequest(req, res));
sosRoutes.get('/citizen/active',authContextMiddleware, (req, res) => sosController.getActiveSosByCitizen(req, res));
sosRoutes.put('/:sosId/tag',authContextMiddleware, (req, res) => sosController.updateSosTag(req, res));

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