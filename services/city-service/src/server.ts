import dotenv from 'dotenv';
import { initializeApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 3005;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger('Database connection established');

    // Initialize application
    const expressApp = await initializeApp();
    logger('Application initialized');

    // Start server
    expressApp.listen(PORT, () => {
      logger(
        `✓ City Service running on http://localhost:${PORT}`,
        'info',
      );
    });
  } catch (error) {
    logger(
      `✗ Failed to start server: ${error instanceof Error ? error.message : String(error)}`,
      'error',
    );
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger('SIGTERM received, shutting down gracefully...', 'info');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger('SIGINT received, shutting down gracefully...', 'info');
  await disconnectDatabase();
  process.exit(0);
});

startServer();
