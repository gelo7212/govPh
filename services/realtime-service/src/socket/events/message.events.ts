import { Socket, Server } from 'socket.io';
import { logger } from '../../utils/logger';
import { SOCKET_EVENTS } from '../../utils/constants';

/**
 * Handle message-related socket events
 * 
 * IMPORTANT: This service only handles UI transport.
 * Messages are CREATED and PERSISTED via HTTP to SOS Service.
 * This just BROADCASTS them to all clients in the SOS room.
 */
export const registerMessageEvents = (io: Server, socket: Socket): void => {
  /**
   * Broadcast new message to all clients in SOS room
   * 
   * This is called by SOS Service after message is persisted.
   * Socket does NOT write to database.
   */
  socket.on(SOCKET_EVENTS.MESSAGE_BROADCAST, async (data: any) => {
    try {
      const { sosId, message } = data;

      if (!sosId || !message) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_MESSAGE_DATA',
          message: 'SOS ID and message are required',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.info('Broadcasting message', {
        messageId: message.id,
        sosId,
        senderType: message.senderType,
        socketId: socket.id,
        options: message.options || {},
      });

      // Broadcast to all clients in SOS room
      io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_BROADCAST, {
        id: message.id,
        sosId: message.sosId,
        senderType: message.senderType,
        senderId: message.senderId || null,
        senderDisplayName: message.senderDisplayName,
        contentType: message.contentType,
        content: message.content,
        createdAt: message.createdAt,
        timestamp: Date.now(),
        options: message.options || {},
      });
    } catch (error) {
      logger.error('Error broadcasting message', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'MESSAGE_BROADCAST_ERROR',
        message: 'Failed to broadcast message',
      });
    }
  });

  /**
   * Typing indicator START - no persistence
   * 
   * User is composing a message
   */
  socket.on('message:typing:start', async (data: any) => {
    try {
      const userId = (socket as any).userId;
      const { sosId, displayName } = data;

      if (!sosId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_SOS_ID',
          message: 'SOS ID is required',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.debug('User typing', {
        userId,
        sosId,
        socketId: socket.id,
      });

      // Broadcast to room (exclude sender)
      socket.to(roomName).emit('message:typing:broadcast', {
        userId,
        displayName,
        sosId,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error handling typing indicator', error);
      // No error emit for typing (UI-only, non-critical)
    }
  });

  /**
   * Typing indicator STOP - no persistence
   */
  socket.on('message:typing:stop', async (data: any) => {
    try {
      const userId = (socket as any).userId;
      const { sosId } = data;

      if (!sosId) {
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.debug('User stopped typing', {
        userId,
        sosId,
        socketId: socket.id,
      });

      // Broadcast to room
      socket.to(roomName).emit('message:typing:stopped', {
        userId,
        sosId,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error handling typing stop', error);
      // No error emit for typing
    }
  });

  /**
   * Request recent messages for SOS
   * 
   * Client asks for message history when joining.
   * SOS Service provides this via HTTP, this is just a fallback trigger.
   */
  socket.on('message:history:request', async (data: any) => {
    try {
      const { sosId, limit = 50, skip = 0 } = data;

      if (!sosId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_SOS_ID',
          message: 'SOS ID is required',
        });
        return;
      }

      logger.info('Message history requested', {
        sosId,
        limit,
        skip,
        socketId: socket.id,
      });

      // Emit response with request ID so client knows it's the response
      socket.emit('message:history:response', {
        sosId,
        message: 'Please fetch messages via HTTP GET /messages/{sosId}/messages',
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error handling message history request', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'HISTORY_REQUEST_ERROR',
        message: 'Failed to request message history',
      });
    }
  });
};

export default registerMessageEvents;
