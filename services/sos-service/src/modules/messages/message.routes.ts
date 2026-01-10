import { Router } from 'express';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';
import { SOSEventHandlers } from './sos.event-handlers';
import { SOSService } from '../sos/sos.service';
import { SOSRepository } from '../sos/sos.repository';
import { MessageEventHandlers } from './message.event-handlers';

const router = Router({ mergeParams: true });
const repository = new MessageRepository();
const service = new MessageService(repository);
const controller = new MessageController(service);
const sosRepository =  new SOSRepository();
const sosService = new SOSService(sosRepository);
// Initialize event handlers
new SOSEventHandlers(service, sosService); // Initialize event handlers
new MessageEventHandlers(service);
/**
 * Send a message to an SOS
 * POST /:sosId/messages
 */
router.post('/', (req, res, next) =>
  controller.sendMessage(req, res).catch(next),
);

/**
 * Get messages for an SOS
 * GET /:sosId/messages
 */
router.get('/', (req, res, next) =>
  controller.getMessages(req, res).catch(next),
);

/**
 * Get single message
 * GET /message/:messageId
 */
router.get('/:messageId', (req, res, next) =>
  controller.getMessage(req, res).catch(next),
);

export default router;
