import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

/**
 * Manages Socket.IO rooms for SOS requests
 */
export class RoomManager {
  constructor(private io: Server) {}

  /**
   * Create and join a room for a specific SOS
   */
  async createSOSRoom(socket: Socket, sosId: string): Promise<void> {
    try {
      const roomName = `sos:${sosId}`;
      socket.join(roomName);
      logger.info('Socket joined SOS room', {
        socketId: socket.id,
        sosId,
        room: roomName,
      });
    } catch (error) {
      logger.error('Error creating SOS room', error);
      throw error;
    }
  }

  /**
   * Remove socket from SOS room
   */
  async leaveSOSRoom(socket: Socket, sosId: string): Promise<void> {
    try {
      const roomName = `sos:${sosId}`;
      socket.leave(roomName);
      logger.info('Socket left SOS room', {
        socketId: socket.id,
        sosId,
        room: roomName,
      });
    } catch (error) {
      logger.error('Error leaving SOS room', error);
      throw error;
    }
  }

  /**
   * Broadcast to all sockets in a specific SOS room
   */
  broadcastToSOSRoom(sosId: string, event: string, data: any): void {
    const roomName = `sos:${sosId}`;
    this.io.to(roomName).emit(event, data);
  }

  /**
   * Get all rooms for a socket
   */
  getSocketRooms(socket: Socket): string[] {
    return Array.from(socket.rooms);
  }

  /**
   * Get socket count in a room
   */
  getRoomSize(sosId: string): number {
    const roomName = `sos:${sosId}`;
    const room = this.io.sockets.adapter.rooms.get(roomName);
    return room?.size || 0;
  }
}

export default RoomManager;
