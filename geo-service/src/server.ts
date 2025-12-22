import app from './app';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { config } from './types/index';

const PORT = config.port;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Geo Service running on http://localhost:${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
