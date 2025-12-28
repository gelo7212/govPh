import { Socket, Server } from 'socket.io';
import { logger } from '../../utils/logger';
import { SOCKET_EVENTS } from '../../utils/constants';

/**
 * Handle participant-related socket events
 * 
 * IMPORTANT: Participants are CREATED/CLOSED via HTTP to SOS Service.
 * This service broadcasts participant changes to UI clients.
 * Socket does NOT write to database.
 */
export const registerParticipantEvents = (io: Server, socket: Socket): void => {
  /**
   * Join SOS chat room (socket-side)
   * 
   * This is DIFFERENT from joining as a participant (HTTP).
   * This just adds the socket to the room for realtime updates.
   */
  socket.on('sos:room:join', async (data: any) => {
    try {
      const userId = (socket as any).userId;
      const { sosId, userType, displayName } = data;

      if (!sosId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_SOS_ID',
          message: 'SOS ID is required',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      // Join the socket room
      socket.join(roomName);
      socket.data.sosId = sosId;
      socket.data.userType = userType;
      socket.data.displayName = displayName;

      logger.info('Socket joined SOS room', {
        userId,
        sosId,
        userType,
        socketId: socket.id,
      });

      // Notify others in room (but not the caller)
      socket.to(roomName).emit('sos:room:joined', {
        userId,
        sosId,
        userType,
        displayName,
        socketId: socket.id,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error joining SOS room', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'ROOM_JOIN_ERROR',
        message: 'Failed to join SOS room',
      });
    }
  });

  /**
   * Leave SOS chat room (socket-side)
   * 
   * User disconnects from realtime updates.
   * This is DIFFERENT from leaving as a participant (HTTP).
   */
  socket.on('sos:room:leave', async (data: any) => {
    try {
      const userId = (socket as any).userId;
      const { sosId } = data;

      if (!sosId) {
        return;
      }

      const roomName = `sos:${sosId}`;

      // Leave the socket room
      socket.leave(roomName);

      logger.info('Socket left SOS room', {
        userId,
        sosId,
        socketId: socket.id,
      });

      // Notify others in room
      io.to(roomName).emit('sos:room:left', {
        userId,
        sosId,
        socketId: socket.id,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error leaving SOS room', error);
    }
  });

  /**
   * Broadcast participant joined (from SOS Service)
   * 
   * Called by SOS Service after participant record is created.
   * This notifies all UI clients that someone joined the SOS.
   */
  socket.on('participant:joined:broadcast', async (data: any) => {
    try {
      const { sosId, userId, userType, displayName, joinedAt } = data;

      if (!sosId || !userId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_PARTICIPANT_DATA',
          message: 'SOS ID and User ID are required',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.info('Broadcasting participant joined', {
        sosId,
        userId,
        userType,
        socketId: socket.id,
      });

      // Broadcast to all in SOS room
      io.to(roomName).emit('participant:joined', {
        sosId,
        userId,
        userType,
        displayName,
        joinedAt,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error broadcasting participant joined', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'PARTICIPANT_BROADCAST_ERROR',
        message: 'Failed to broadcast participant joined',
      });
    }
  });

  /**
   * Broadcast participant left (from SOS Service)
   * 
   * Called by SOS Service after participant record is closed.
   * This notifies UI clients that someone left the SOS.
   */
  socket.on('participant:left:broadcast', async (data: any) => {
    try {
      const { sosId, userId, leftAt } = data;

      if (!sosId || !userId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_PARTICIPANT_DATA',
          message: 'SOS ID and User ID are required',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      logger.info('Broadcasting participant left', {
        sosId,
        userId,
        socketId: socket.id,
      });

      // Broadcast to all in SOS room
      io.to(roomName).emit('participant:left', {
        sosId,
        userId,
        leftAt,
        timestamp: Date.now(),
      });

      // If participant's own socket is in room, also leave socket room
      const sockets = await io.in(roomName).fetchSockets();
      const participantSockets = sockets.filter(
        (s) => (s as any).userId === userId,
      );
      participantSockets.forEach((s) => s.leave(roomName));
    } catch (error) {
      logger.error('Error broadcasting participant left', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'PARTICIPANT_LEFT_ERROR',
        message: 'Failed to broadcast participant left',
      });
    }
  });

  /**
   * Get active participants in SOS room (UI query)
   * 
   * Returns socket-level view of who's currently connected.
   * Does NOT query database (use HTTP for authoritative list).
   */
  socket.on('participants:active:request', async (data: any) => {
    try {
      const { sosId } = data;

      if (!sosId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_SOS_ID',
          message: 'SOS ID is required',
        });
        return;
      }

      const roomName = `sos:${sosId}`;

      // Get all sockets in room
      const sockets = await io.in(roomName).fetchSockets();
      const activeUsers = sockets.map((s) => ({
        userId: (s as any).userId,
        displayName: s.data.displayName,
        userType: s.data.userType,
        socketId: s.id,
        connectedAt: (s as any).connectedAt || Date.now(),
      }));

      logger.info('Active participants requested', {
        sosId,
        count: activeUsers.length,
      });

      socket.emit('participants:active:response', {
        sosId,
        participants: activeUsers,
        count: activeUsers.length,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error fetching active participants', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'PARTICIPANTS_FETCH_ERROR',
        message: 'Failed to fetch active participants',
      });
    }
  });
};

export default registerParticipantEvents;
