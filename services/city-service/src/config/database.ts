import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const mongoCreds = process.env.MONGODB_URI || '';
  const env = process.env.NODE_ENV || 'local';
  const mongoOptions = process.env.MONGODB_URI_OPTIONS || undefined;
  let mongoDbName = 'city-service';
  if(env !== 'local'){
    mongoDbName = `city-service-${env}`;
  }

  const mongoUri = mongoOptions
    ? `${mongoCreds}/${mongoDbName}?${mongoOptions}`
    : `${mongoCreds}/${mongoDbName}`;

  try {
    console.log('Connecting to MongoDB at', mongoUri);
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
