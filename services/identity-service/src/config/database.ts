import mongoose, { Connection } from 'mongoose';
import UserSchema from '../modules/user/user.mongo.schema';
import RescuerMissionSchema from '../modules/rescuer/rescuer.mongo.schema';
import AuditLogSchema from '../services/auditLog.mongo.schema';
import { createLogger } from '../utils/logger';

const logger = createLogger('Database');

let mongoConnection: Connection | null = null;

export const connectMongoDB = async (): Promise<Connection> => {
  try {
    const mongoCreds = process.env.MONGODB_URI || '';
    const env = process.env.NODE_ENV || 'local';
    const mongoOptions = process.env.MONGODB_URI_OPTIONS || undefined;
    let mongoDbName = 'identity-service';
    if(env !== 'local'){
      mongoDbName = `identity-service-${env}`;
    }

    const mongoUri = mongoOptions
      ? `${mongoCreds}/${mongoDbName}?${mongoOptions}`
      : `${mongoCreds}/${mongoDbName}`;

    if (mongoConnection) {
      logger.info('MongoDB already connected');
      return mongoConnection;
    }
    logger.info('Attempting to connect to MongoDB', { mongoUri });

    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

    mongoConnection = mongoose.connection;
    
    // Register schemas
    mongoConnection.model('users', UserSchema);
    mongoConnection.model('rescuer_missions', RescuerMissionSchema);
    mongoConnection.model('audit_logs', AuditLogSchema);

    logger.info('MongoDB connected successfully');

    return mongoConnection;
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    if (mongoConnection) {
      await mongoose.disconnect();
      mongoConnection = null;
      logger.info('MongoDB disconnected');
    }
  } catch (error) {
    logger.error('MongoDB disconnection failed:', error);
    throw error;
  }
};

export const getMongoConnection = (): Connection => {
  if (!mongoConnection) {
    throw new Error(
      'MongoDB not connected. Call connectMongoDB first.'
    );
  }
  return mongoConnection;
};

export const getCollection = (collectionName: string) => {
  const connection = getMongoConnection();
  return connection.collection(collectionName);
};
