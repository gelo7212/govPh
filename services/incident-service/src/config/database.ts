import mongoose from 'mongoose';
import { createLogger } from '../utils/logger';

const logger = createLogger('Database');

let mongoClient: typeof mongoose | null = null;

/**
 * Connect to MongoDB
 */
export async function connectMongoDB(): Promise<typeof mongoose> {
  try {
    const mongoUri =
      process.env.MONGODB_URI || `mongodb://host.docker.internal:27017/${process.env.MICROSERVICE_NAME || 'identity-service'}`;


    console.log('Connecting to MongoDB at', mongoUri);
    if (mongoClient && mongoClient.connection.readyState === 1) {
      logger.info('Already connected to MongoDB');
      return mongoClient;
    }

    mongoClient = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('Connected to MongoDB successfully');
    return mongoClient;
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    throw error;
  }
}

/**
 * Get a collection from MongoDB
 */
export function getCollection(collectionName: string) {
  if (!mongoClient || mongoClient.connection.readyState !== 1) {
    throw new Error('MongoDB not connected');
  }
  return mongoClient.connection.collection(collectionName);
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongoDB(): Promise<void> {
  try {
    if (mongoClient) {
      await mongoClient.disconnect();
      mongoClient = null;
      logger.info('Disconnected from MongoDB');
    }
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', error);
  }
}
