import { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { MessageBroadcastRequest } from './messaging.types';
import { Server as SocketIOServer } from 'socket.io';

/**
 * Messaging Controller
 * Handles HTTP requests for messaging operations
 */
export class MessagingController {
  constructor(private io: SocketIOServer) {}

  /**
   * Broadcast message to SOS room
   * POST /internal/messaging/broadcast
   * Called by SOS Service after message is persisted
   */
  async broadcastMessage(req: Request, res: Response): Promise<void> {
    try {
        const payload = req.body as MessageBroadcastRequest;
        logger.info('BroadcastMessage payload', JSON.stringify(payload));
        if (!payload.sosId || !payload.message) {
            res.status(400).json({
            success: false,
            error: 'Missing required fields: sosId, message',
            });
            return;
        }

        logger.info('Received message broadcast request', {
            sosId: payload.sosId,
            messageId: payload.message.id,
        });

        const roomName = `sos:${payload.sosId}`;
        this.io.to(roomName).emit('message:broadcast', {
            id: payload.message.id,
            sosId: payload.message.sosId,
            senderType: payload.message.senderType,
            senderId: payload.message.senderId || null,
            senderDisplayName: payload.message.senderDisplayName,
            contentType: payload.message.contentType,
            content: payload.message.content,
            createdAt: payload.message.createdAt,
            timestamp: Date.now(),
            options: payload.message.options || {}
        });

        res.status(200).json({
            success: true,
            message: 'Message broadcasted successfully',
        });
    } catch (error) {
      logger.error('Error broadcasting message', error);
      res.status(500).json({
        success: false,
        error: 'Failed to broadcast message',
      });
    }
  }
}
