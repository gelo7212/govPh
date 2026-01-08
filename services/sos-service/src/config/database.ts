import mongoose, { Connection } from 'mongoose';

let mongoConnection: Connection | null = null;

export const connectMongoDB = async (): Promise<Connection> => {
  try {
    const mongoCreds = process.env.MONGODB_URI || '';
    const env = process.env.NODE_ENV || 'local';
    const mongoOptions = process.env.MONGODB_URI_OPTIONS || '';
    let mongoDbName = 'sos-service';
    if(env !== 'local'){
      mongoDbName = `sos-service-${env}`;
    }

    const mongoUri = mongoOptions
      ? `${mongoCreds}/${mongoDbName}?${mongoOptions}`
      : `${mongoCreds}/${mongoDbName}`;


    if (mongoConnection) {
      console.log('MongoDB already connected');
      return mongoConnection;
    }
    console.info('Attempting to connect to MongoDB');

    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

    const adminDb = mongoose.connection.getClient().db('admin');
    const databases = await adminDb.admin().listDatabases();
    if(databases.databases == null) {
      console.info('No databases found on the server.');
    }

    const dbExists = databases.databases.some(db => db!.name === (process.env.MICROSERVICE_NAME || 'sos-service'));

    if (!dbExists) {
      console.info('Creating sos-service database');
      const targetDb = mongoose.connection.getClient().db(process.env.MICROSERVICE_NAME || 'sos-service');
      // Create a system collection to ensure database is created
      await targetDb.createCollection('__init__');
      await targetDb.collection('__init__').deleteMany({});
    }

    mongoConnection = mongoose.connection;
    console.log('MongoDB connected successfully');

    return mongoConnection;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    if (mongoConnection) {
      await mongoose.disconnect();
      mongoConnection = null;
      console.log('MongoDB disconnected');
    }
  } catch (error) {
    console.error('MongoDB disconnection failed:', error);
    throw error;
  }
};

export const getMongoConnection = (): Connection => {
  if (!mongoConnection) {
    throw new Error('MongoDB not connected. Call connectMongoDB first.');
  }
  return mongoConnection;
};
