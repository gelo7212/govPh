import mongoose, { Connection } from 'mongoose';
import { createLogger } from '../utils/logger';

const logger = createLogger('Database');

let mongoConnection: Connection | null = null;

export const connectMongoDB = async (): Promise<Connection> => {
  try {
    const mongoCreds = process.env.MONGODB_URI || '';
    const env = process.env.NODE_ENV || 'local';
    const mongoOptions = process.env.MONGODB_URI_OPTIONS || undefined;
    
    let mongoDbName = 'submission-service';
    if (env !== 'local') {
      mongoDbName = `submission-service-${env}`;
    }

    const mongoUri = mongoOptions
      ? `${mongoCreds}/${mongoDbName}?${mongoOptions}`
      : `${mongoCreds}/${mongoDbName}`;

    if (mongoConnection) {
      logger.info('MongoDB already connected');
      return mongoConnection;
    }

    logger.info('Attempting to connect to MongoDB', { uri: mongoUri });

    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

    mongoConnection = mongoose.connection;

    // Models are automatically registered when imported
    // SchemaModel, SubmissionModel, DraftModel are already instantiated
    logger.info('MongoDB connected successfully');

    return mongoConnection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    throw error;
  }
};

export const getMongoConnection = (): Connection => {
  if (!mongoConnection) {
    throw new Error('MongoDB connection not initialized');
  }
  return mongoConnection;
};

export const disconnectMongoDB = async (): Promise<void> => {
  if (mongoConnection) {
    await mongoose.disconnect();
    mongoConnection = null;
    logger.info('MongoDB disconnected');
  }
};
