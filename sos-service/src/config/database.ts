import mongoose, { Connection } from 'mongoose';

let mongoConnection: Connection | null = null;

export const connectMongoDB = async (): Promise<Connection> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sos-service';

    if (mongoConnection) {
      console.log('MongoDB already connected');
      return mongoConnection;
    }

    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

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
