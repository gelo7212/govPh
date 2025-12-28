import { Server, Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { SOCKET_EVENTS } from '../../utils/constants';
import { MessageBroadcastRequest, BroadcastedMessage, TypingIndicatorData, TypingBroadcastData } from './messaging.types';

/**
 * Messaging Service
 * Handles message broadcasting and typing indicators via Socket.IO
 * 
 * IMPORTANT: This service only handles UI transport.
 * Messages are CREATED and PERSISTED via HTTP to SOS Service.
 * This just BROADCASTS them to all clients in the SOS room.
 */
export class MessagingService {
  constructor(private io: Server) {}

  /**
   * Broadcast message to all clients in SOS room
   * Called by SOS Service after message is persisted
   */
  broadcastMessage(request: MessageBroadcastRequest): void {
    try {
      const { sosId, message } = request;

      if (!sosId || !message) {
        logger.error('Invalid message broadcast request', { sosId, message });
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.info('Broadcasting message', {
        messageId: message.id,
        sosId,
        senderType: message.senderType,
      });

      const broadcastData: BroadcastedMessage = {
        id: message.id,
        sosId: message.sosId,
        senderType: message.senderType,
        senderId: message.senderId || null,
        senderDisplayName: message.senderDisplayName,
        contentType: message.contentType,
        content: message.content,
        createdAt: message.createdAt,
        timestamp: Date.now(),
      };

      // Broadcast to all clients in SOS room
      this.io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_BROADCAST, broadcastData);
    } catch (error) {
      logger.error('Error broadcasting message', error);
    }
  }

  /**
   * Broadcast typing indicator START
   * User is composing a message
   */
  broadcastTypingStart(socket: Socket, userId: string, data: TypingIndicatorData): void {
    try {
      const { sosId, displayName } = data;

      if (!sosId) {
        logger.error('Invalid typing indicator - missing sosId');
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.debug('User typing', {
        userId,
        sosId,
        socketId: socket.id,
      });

      const broadcastData: TypingBroadcastData = {
        userId,
        displayName,
        sosId,
        timestamp: Date.now(),
      };

      // Broadcast to room (exclude sender)
      socket.to(roomName).emit('message:typing:broadcast', broadcastData);
    } catch (error) {
      logger.error('Error handling typing start indicator', error);
    }
  }

  /**
   * Broadcast typing indicator STOP
   * User stopped composing
   */
  broadcastTypingStop(socket: Socket, userId: string, sosId: string): void {
    try {
      if (!sosId) {
        logger.error('Invalid typing stop indicator - missing sosId');
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.debug('User stopped typing', {
        userId,
        sosId,
        socketId: socket.id,
      });

      // Broadcast to room (exclude sender)
      socket.to(roomName).emit('message:typing:stopped', {
        userId,
        sosId,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error handling typing stop indicator', error);
    }
  }

  /**
   * Emit error to client
   */
  emitError(socket: Socket, code: string, message: string): void {
    socket.emit(SOCKET_EVENTS.ERROR, {
      code,
      message,
    });
  }
}
