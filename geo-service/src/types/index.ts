import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri:
    process.env.MONGO_URI || 'mongodb://localhost:27017/geo-service',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
