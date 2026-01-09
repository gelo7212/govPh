import mongoose, { Connection } from 'mongoose';


let mongoConnection: Connection | null = null;

export const connectDatabase = async (): Promise<Connection> => {
  try {
    const mongoCreds = process.env.MONGODB_URI || '';
    const env = process.env.NODE_ENV || 'local';
    const mongoOptions = process.env.MONGODB_URI_OPTIONS || undefined;
    let mongoDbName = 'geo-service';
    if(env !== 'local'){
      mongoDbName = `geo-service-${env}`;
    }

    const mongoUri = mongoOptions
      ? `${mongoCreds}/${mongoDbName}?${mongoOptions}`
      : `${mongoCreds}/${mongoDbName}`;


    if (mongoConnection) {
      console.log('Already connected to MongoDB');
      return mongoConnection;
    }

    console.log('Attempting to connect to MongoDB');
    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

    mongoConnection = mongoose.connection;

    // Database existence check and creation (after connection is established)
    const adminDb = mongoose.connection.getClient().db('admin');
    const databases = await adminDb.admin().listDatabases();
    const dbExists = databases.databases.some(db => db.name === (process.env.MICROSERVICE_NAME || 'geo-service'));

    if (!dbExists) {
      console.log('Creating geo-service database');
      const targetDb = mongoose.connection.getClient().db(process.env.MICROSERVICE_NAME || 'geo-service');
      // Create a system collection to ensure database is created
      await targetDb.createCollection('__init__');
      await targetDb.collection('__init__').deleteMany({});
    }

    console.log('MongoDB connected successfully');

    return mongoConnection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
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
    throw new Error('MongoDB not connected. Call connectDatabase first.');
  }
  return mongoConnection;
};

export const getCollection = (collectionName: string) => {
  const connection = getMongoConnection();
  return connection.collection(collectionName);
};
