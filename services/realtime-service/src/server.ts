import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import createApp from './app';
import { config } from './config/env';
import socketIOConfig from './config/socket';
import { initializeSocketIO } from './socket';
import redisClient from './config/redis';
import { logger } from './utils/logger';
import { registerLocationEvents } from './socket/events/location.events';
import { registerSOSEvents } from './socket/events/sos.events';
import { registerMessageEvents } from './socket/events/message.events';
import { registerParticipantEvents } from './socket/events/participant.events';
import { registerSystemEvents } from './socket/events/system.events';

let server: http.Server;
let io: SocketIOServer;

async function startServer(): Promise<void> {
  try {
    // Create HTTP server first (without app)
    server = http.createServer();

    // Initialize Socket.IO
    io = initializeSocketIO(server, socketIOConfig);

    // Create Express app with io instance for messaging routes
    const app = createApp(io);
    server.on('request', app);

    // Register event handlers
    io.on('connection', (socket: any) => {
      logger.info('New socket connection', {
        socketId: socket.id,
        userId: (socket as any).userId,
      });

      // Register all event types
      registerLocationEvents(io, socket);
      registerSOSEvents(io, socket);
      registerMessageEvents(io, socket);
      registerParticipantEvents(io, socket);
      registerSystemEvents(io, socket);
    });

    // Connect to Redis
    await redisClient.connect();
    logger.info('Redis connected');

    // Start server
    server.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`, {
        env: config.NODE_ENV,
      });
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      shutdown();
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      shutdown();
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

async function shutdown(): Promise<void> {
  try {
    logger.info('Shutting down server');

    // Close Socket.IO
    if (io) {
      io.close();
    }

    // Close HTTP server
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });
    }

    // Disconnect Redis
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      logger.info('Redis disconnected');
    }

    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
}

startServer();

export { server, io };
