import { initializeApp } from './app';
import { createLogger } from './utils/logger';

const logger = createLogger('Server');

const PORT = process.env.PORT || 3001;

/**
 * Start the Identity Service
 */
const startServer = async () => {
  try {
    const app = await initializeApp();

    app.listen(PORT, () => {
      logger.info(`Identity Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
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
