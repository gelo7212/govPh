import mongoose, { Connection } from 'mongoose';
import UserSchema from '../modules/user/user.mongo.schema';
import RescuerMissionSchema from '../modules/rescuer/rescuer.mongo.schema';
import AuditLogSchema from '../services/auditLog.mongo.schema';
import { createLogger } from '../utils/logger';

const logger = createLogger('Database');

let mongoConnection: Connection | null = null;

export const connectMongoDB = async (): Promise<Connection> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || `mongodb://host.docker.internal:27017/${process.env.MICROSERVICE_NAME || 'identity-service'}`;

    if (mongoConnection) {
      logger.info('MongoDB already connected');
      return mongoConnection;
    }
    logger.info('Attempting to connect to MongoDB');

    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

    mongoConnection = mongoose.connection;

    // Database existence check and creation (after connection is established)
    const adminDb = mongoose.connection.getClient().db('admin');
    const databases = await adminDb.admin().listDatabases();
    const dbExists = databases.databases.some(db => db.name === (process.env.MICROSERVICE_NAME || 'identity-service'));

    if (!dbExists) {
      logger.info('Creating identity-service database');
      const targetDb = mongoose.connection.getClient().db(process.env.MICROSERVICE_NAME || 'identity-service');
      // Create a system collection to ensure database is created
      await targetDb.createCollection('__init__');
      await targetDb.collection('__init__').deleteMany({});
    }

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
