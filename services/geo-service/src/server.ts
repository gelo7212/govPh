import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { config } from './types/index';
import { createClient } from 'redis';
import { reverseGeocodingController } from './modules/reverse-geocoding/reverse-geocoding.routes';

const PORT = config.port;

// Initialize Redis client for caching
const initializeRedisClient = async () => {
  try {
    const redisClient = createClient({
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            logger.error('Too many Redis reconnection attempts, giving up.');
            return new Error('Too many Redis reconnection retries.');
          }
          return retries * 100;
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.warn('Failed to initialize Redis client, caching will be disabled', error);
    return null;
  }
};

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize Redis for reverse geocoding cache
    const redisClient = await initializeRedisClient();
    if (redisClient) {
      reverseGeocodingController.setRedisClient(redisClient);
      logger.info('Reverse geocoding service initialized with Redis caching');
    } else {
      logger.warn('Reverse geocoding service running without caching');
    }

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Geo Service running on http://localhost:${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
