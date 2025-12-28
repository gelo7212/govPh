import { Router } from 'express';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';

const router = Router({ mergeParams: true });
const repository = new MessageRepository();
const service = new MessageService(repository);
const controller = new MessageController(service);

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
