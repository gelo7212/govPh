import redisClient from '../config/redis';
import { logger } from '../utils/logger';

/**
 * Redis Service - Handles all Redis operations
 */
export class RedisService {
  /**
   * Get value from Redis
   */
  static async get(key: string): Promise<any> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis GET error', { key, error });
      throw error;
    }
  }

  /**
   * Set value in Redis with TTL
   */
  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Redis SET error', { key, error });
      throw error;
    }
  }

  /**
   * Delete key from Redis
   */
  static async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error('Redis DEL error', { key, error });
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error', { key, error });
      throw error;
    }
  }

  /**
   * Get all keys matching pattern
   */
  static async keys(pattern: string): Promise<string[]> {
    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error', { pattern, error });
      throw error;
    }
  }
}

export default RedisService;
