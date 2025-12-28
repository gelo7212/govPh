import { Router, Request, Response } from 'express';
import { SosController } from './sos.controller';
import { SosAggregator } from './sos.aggregator';
import { MessageController } from './sos.message.controller';
import { MessageAggregator } from './sos.message.aggregator';
import { SosServiceClient, UserContext } from '@gov-ph/bff-core';
import { validate, createSOSSchema, updateLocationSchema, sendMessageSchema } from '../../utils/validators';
import { createAttachUserContextMiddleware } from '../../middlewares/attachUserContext';

export const sosRoutes = Router();

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
sosRoutes.post('/', validate(createSOSSchema), (req, res) => sosController.createSosRequest(req, res));
sosRoutes.get('/:sosId', (req, res) => sosController.getSosRequest(req, res));
sosRoutes.get('/user/requests', (req, res) => sosController.getUserSosRequests(req, res));
sosRoutes.delete('/:sosId', (req, res) => sosController.cancelSosRequest(req, res));
sosRoutes.get('/citizen/active', (req, res) => sosController.getActiveSosByCitizen(req, res));
sosRoutes.put('/:sosId/tag', (req, res) => sosController.updateSosTag(req, res));

// Message Routes - nested under SOS
/**
 * Send a message to an SOS conversation
 * POST /:sosId/messages
 */
sosRoutes.post('/:sosId/messages', (req, res) => messageController.sendMessage(req, res));

/**
 * Get all messages for an SOS conversation
 * GET /:sosId/messages
 */
sosRoutes.get('/:sosId/messages', (req, res) => messageController.getMessages(req, res));

/**
 * Get a single message by ID
 * GET /message/:messageId
 */
sosRoutes.get('/message/:messageId', (req, res) => messageController.getMessage(req, res));