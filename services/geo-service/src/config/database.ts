import mongoose from 'mongoose';

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/geo-service';

    await mongoose.connect(mongoUri);

    isConnected = true;
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('Disconnected from MongoDB');
  }
};

export const getMongooseConnection = () => mongoose;
