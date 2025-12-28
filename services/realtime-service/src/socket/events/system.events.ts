import { Socket, Server } from 'socket.io';
import { logger } from '../../utils/logger';
import { SOCKET_EVENTS } from '../../utils/constants';

/**
 * Handle system-level socket events
 */
export const registerSystemEvents = (_io: Server, socket: Socket): void => {
  /**
   * Ping-pong for connection health
   */
  socket.on('ping', (data: any) => {
    socket.emit('pong', {
      ...data,
      respondedAt: Date.now(),
    });
  });

  /**
   * Handle client-side heartbeat
   */
  socket.on('heartbeat', async (_data: any) => {
    try {
      const userId = (socket as any).userId;

      // Update presence in Redis
      const presenceManager = (socket as any).presenceManager;
      if (presenceManager) {
        await presenceManager.updateLastActivity(userId);
      }

      socket.emit('heartbeat:ack', {
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error handling heartbeat', error);
    }
  });

  /**
   * Handle reconnection attempts
   */
  socket.on('reconnect_attempt', () => {
    logger.info('Client attempting reconnection', {
      socketId: socket.id,
      userId: (socket as any).userId,
    });
  });

  /**
   * Generic error handler
   */
  socket.on(SOCKET_EVENTS.ERROR, (error: any) => {
    logger.error('Socket error received', {
      socketId: socket.id,
      userId: (socket as any).userId,
      error,
    });
  });
};

export default registerSystemEvents;
