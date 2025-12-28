import { Router, Request, Response, NextFunction } from 'express';
import { MessagingController } from './messaging.controller';
import { internalAuthMiddleware } from '../../middleware/internalAuth.middleware';
import { validate } from '../../utils/validators';
import { messageBroadcastSchema } from './messaging.schema';
import { Server as SocketIOServer } from 'socket.io';

const createMessagingRoutes = (io: SocketIOServer): Router => {
  const router = Router();
  const controller = new MessagingController(io);

  // All routes require internal authentication
  router.use(internalAuthMiddleware);

  /**
   * POST /internal/messaging/broadcast
   * Broadcast message to SOS room
   * Called by SOS Service after message is persisted
   */
  router.post('/broadcast', validate(messageBroadcastSchema), (req: Request, res: Response, next: NextFunction) =>
    controller.broadcastMessage(req, res).catch(next),
  );

  return router;
};

export default createMessagingRoutes;
