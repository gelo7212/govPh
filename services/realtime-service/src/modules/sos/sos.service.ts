import redisClient from '../../config/redis';
import { logger } from '../../utils/logger';
import { REDIS_KEYS } from '../../utils/constants';

/**
 * SOS Service - Manages realtime SOS state
 */
export class SOSService {
  /**
   * Initialize SOS realtime context
   */
  async initSOS(sosId: string, citizenId: string, location: any, address: any): Promise<any> {
    try {
      const state = {
        sosId,
        citizenId,
        status: 'active',
        createdAt: Date.now(),
        lastLocationUpdate: Date.now(),
        location: location || null,
        address: address || null,
      };

      const key = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
      await redisClient.setEx(key, 86400, JSON.stringify(state)); // 24 hour TTL

      logger.info('SOS initialized in realtime', { sosId, citizenId });

      return state;
    } catch (error) {
      logger.error('Error initializing SOS', error);
      throw error;
    }
  }

  /**
   * Close SOS realtime context
   */
  async closeSOS(sosId: string, closedBy: string): Promise<void> {
    try {
      const key = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
      const data = await redisClient.get(key);

      if (data) {
        const state = JSON.parse(data);
        state.status = 'closed';
        state.closedAt = Date.now();
        state.closedBy = closedBy;

        // Keep for 1 hour after closing for history
        await redisClient.setEx(key, 3600, JSON.stringify(state));
      }

      logger.info('SOS closed in realtime', { sosId, closedBy });
    } catch (error) {
      logger.error('Error closing SOS', error);
      throw error;
    }
  }

  /**
   * Get current SOS state
   */
  async getSOSState(sosId: string): Promise<any> {
    try {
      const key = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Error getting SOS state', error);
      return null;
    }
  }

  /**
   * Update SOS location
   */
  async updateSOSLocation(sosId: string, location: any, address: any): Promise<void> {
    try {
      const state = await this.getSOSState(sosId);
      
      if (state) {
        state.location = location;
        state.address = address;
        state.lastLocationUpdate = Date.now();

        const key = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
        await redisClient.setEx(key, 86400, JSON.stringify(state));
      }
    } catch (error) {
      logger.error('Error updating SOS location', error);
      throw error;
    }
  }
}

export default SOSService;
