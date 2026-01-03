import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || `mongodb://host.docker.internal:27017/${process.env.MICROSERVICE_NAME || 'city-service'}`;
  
  
  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10'),
      minPoolSize: 2,
    });
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
}

export function disconnectDatabase(): Promise<void> {
  return mongoose.disconnect();
}

export default mongoose;
