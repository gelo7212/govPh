import { createClient } from 'redis';
import { config } from './env';
import { logger } from '../utils/logger';

const redisClient = createClient({
  password: config.REDIS_PASSWORD,
  socket: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    reconnectStrategy: (retries: number) => {
      console.log("Connecting to redis..."+ process.env.REDIS_HOST, process.env.REDIS_PORT, process.env.REDIS_PASSWORD);
      if (retries > 10) {
        logger.error('Too many reconnection attempts, giving up.');
        return new Error('Too many reconnection retries.');
      }
      return retries * 100;
    },
  },
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.on('connect', async () => {
  logger.info('Redis Client Connected');
  await redisClient.select(config.REDIS_DB);
});

export default redisClient;
