import { Socket, Server } from 'socket.io';
import { logger } from '../../utils/logger';
import { SOCKET_EVENTS } from '../../utils/constants';

/**
 * Handle SOS-specific socket events
 */
export const registerSOSEvents = (io: Server, socket: Socket): void => {

  /**
   * Join SOS room when client initializes SOS
   * If SOS record expired (not found in Redis), reinitialize it
   */
  socket.on(SOCKET_EVENTS.SOS_INIT, async (data: any) => {
    try {
      const userId = (socket as any).userId || 'Rescuer-Unknown';
      const sosId = data.sosId;

      if (!sosId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_SOS_ID',
          message: 'SOS ID is required',
        });
        return;
      }


      // Join the SOS room
      const roomName = `sos:${sosId}`;
      socket.join(roomName);

      logger.info('User joined SOS room', {
        userId,
        sosId,
        socketId: socket.id,
      });

      // Broadcast to room that user joined
      io.to(roomName).emit(SOCKET_EVENTS.SOS_INIT, {
        userId,
        sosId,
        action: 'user_joined',
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error handling SOS init', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'SOS_INIT_ERROR',
        message: 'Failed to initialize SOS',
      });
    }
  });

  /**
   * Handle SOS close event
   */
  socket.on(SOCKET_EVENTS.SOS_CLOSE, async (data: any) => {
    try {
      const userId = (socket as any).userId;
      const sosId = data.sosId;

      if (!sosId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_SOS_ID',
          message: 'SOS ID is required',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.info('SOS closed', {
        userId,
        sosId,
      });

      // Broadcast closure to room
      io.to(roomName).emit(SOCKET_EVENTS.SOS_CLOSE, {
        sosId,
        closedBy: userId,
        timestamp: Date.now(),
      });

      // Leave room
      socket.leave(roomName);
    } catch (error) {
      logger.error('Error handling SOS close', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'SOS_CLOSE_ERROR',
        message: 'Failed to close SOS',
      });
    }
  });

  /**
   * Handle SOS status updates
   */
  socket.on(SOCKET_EVENTS.SOS_STATUS_UPDATE, async (data: any) => {
    try {
      const userId = (socket as any).userId;
      const sosId = data.sosId;
      const status = data.status;

      if (!sosId || !status) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_STATUS_DATA',
          message: 'SOS ID and status are required',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.info('SOS status updated', {
        userId,
        sosId,
        status,
      });

      // Broadcast status to room
      io.to(roomName).emit(SOCKET_EVENTS.SOS_STATUS_BROADCAST, {
        sosId,
        status,
        updatedBy: userId,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error handling SOS status update', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'STATUS_UPDATE_ERROR',
        message: 'Failed to update SOS status',
      });
    }
  });
};

export default registerSOSEvents;
