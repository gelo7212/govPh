import dotenv from 'dotenv';
import { initializeApp } from './app';
import { createLogger } from './utils/logger';

// Load environment variables from .env file
dotenv.config();

const logger = createLogger('Server');

const PORT = process.env.PORT || 3006;

/**
 * Start the File Management Service
 */
const startServer = async () => {
  try {
    const app = await initializeApp();

    app.listen(PORT, () => {
      logger.info(`File Management Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Storage Provider: ${process.env.STORAGE_PROVIDER || 'LOCAL'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
