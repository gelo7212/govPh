import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/env';
import { logger } from './utils/logger';
import sosRoutes from './modules/sos/sos.routes';
import createMessagingRoutes from './modules/messaging/messaging.routes';

dotenv.config();

export const createApp = (io?: SocketIOServer): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((_req, _res, next) => {
    logger.info('Incoming request', {
      method: _req.method,
      path: _req.path,
      ip: _req.ip,
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // Ready check endpoint
  app.get('/ready', (_req, res) => {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  });

  // Internal API routes
  app.use('/internal/realtime/sos', sosRoutes);
  if (io) {
    app.use('/internal/messaging', createMessagingRoutes(io));
  }

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
    });
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error', {
      message: err.message,
      path: req.path,
      method: req.method,
      stack: err.stack,
    });

    res.status(err.statusCode || 500).json({
      error: 'Internal Server Error',
      message: config.NODE_ENV === 'development' ? err.message : 'An error occurred',
    });
  });

  return app;
};

export default createApp;
