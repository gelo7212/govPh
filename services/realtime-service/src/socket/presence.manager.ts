import { Server, Socket } from 'socket.io';
import redisClient from '../config/redis';
import { logger } from '../utils/logger';
import { REDIS_KEYS } from '../utils/constants';
import { SocketSession } from '../types/socket.types';

/**
 * Manages user presence and session information
 */
export class PresenceManager {
  constructor(private io: Server) {}

  /**
   * Record user presence in Redis
   */
  async setUserPresence(socket: Socket, userId: string, sosId: string): Promise<void> {
    try {
      const session: SocketSession = {
        socketId: socket.id,
        userId,
        sosId,
        role: (socket as any).role || 'unknown',
        connectedAt: Date.now(),
        lastActivityAt: Date.now(),
      };

      const key = `${REDIS_KEYS.USER_PRESENCE}:${userId}`;
      await redisClient.setEx(key, 3600, JSON.stringify(session)); // 1 hour TTL

      logger.info('User presence recorded', {
        userId,
        sosId,
      });
    } catch (error) {
      logger.error('Error setting user presence', error);
      throw error;
    }
  }

  /**
   * Remove user presence from Redis
   */
  async removeUserPresence(userId: string): Promise<void> {
    try {
      const key = `${REDIS_KEYS.USER_PRESENCE}:${userId}`;
      await redisClient.del(key);
      logger.info('User presence removed', { userId });
    } catch (error) {
      logger.error('Error removing user presence', error);
      throw error;
    }
  }

  /**
   * Get user presence from Redis
   */
  async getUserPresence(userId: string): Promise<SocketSession | null> {
    try {
      const key = `${REDIS_KEYS.USER_PRESENCE}:${userId}`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Error getting user presence', error);
      return null;
    }
  }

  /**
   * Update last activity timestamp
   */
  async updateLastActivity(userId: string): Promise<void> {
    try {
      const session = await this.getUserPresence(userId);
      if (session) {
        session.lastActivityAt = Date.now();
        const key = `${REDIS_KEYS.USER_PRESENCE}:${userId}`;
        await redisClient.setEx(key, 3600, JSON.stringify(session));
      }
    } catch (error) {
      logger.error('Error updating last activity', error);
    }
  }

  /**
   * Get all users in a SOS room
   */
  async getSOSRoomUsers(sosId: string): Promise<SocketSession[]> {
    try {
      const roomName = `sos:${sosId}`;
      const room = this.io.sockets.adapter.rooms.get(roomName);

      if (!room) {
        return [];
      }

      const users: SocketSession[] = [];
      for (const socketId of room) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          const userId = (socket as any).userId;
          const session = await this.getUserPresence(userId);
          if (session) {
            users.push(session);
          }
        }
      }

      return users;
    } catch (error) {
      logger.error('Error getting SOS room users', error);
      return [];
    }
  }
}

export default PresenceManager;
