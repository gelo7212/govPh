import dotenv from 'dotenv';

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  INTERNAL_AUTH_TOKEN: process.env.INTERNAL_AUTH_TOKEN || 'internal-secret-key',
  SOS_MS_URL: process.env.SOS_MS_URL || 'http://localhost:3001',
  CORS_ORIGIN: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY || '',
};

export default config;
