import mongoose from 'mongoose';
import { createLogger } from '../utils/logger';

const logger = createLogger('Database');

export async function connectDatabase(): Promise<void> {
  const mongoCreds = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const env = process.env.NODE_ENV || 'local';
  const mongoOptions = process.env.MONGODB_URI_OPTIONS || undefined;
  let mongoDbName = 'file-management';
  if (env !== 'local') {
    mongoDbName = `file-management-${env}`;
  }

  const mongoUri = mongoOptions
    ? `${mongoCreds}/${mongoDbName}?${mongoOptions}`
    : `${mongoCreds}/${mongoDbName}`;

  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10'),
      minPoolSize: 2,
    });
    logger.info('✓ MongoDB connected successfully');
  } catch (error) {
    logger.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
}

export function disconnectDatabase(): Promise<void> {
  return mongoose.disconnect();
}

export default mongoose;
