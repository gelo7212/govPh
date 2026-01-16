import express, { Express, Request, Response, NextFunction } from 'express';
import { connectDatabase } from './config/database';
import { ApiResponse } from './types';
import { getErrorResponse } from './errors';
import { createLogger } from './utils/logger';
import fileRoutes from './modules/files/files.routes';
import { requestLogger } from './middlewares/requestLogger.middleware';

const logger = createLogger('App');

export const createApp = async (): Promise<Express> => {
  const app = express();

  // Connect to MongoDB
  await connectDatabase();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use(requestLogger);

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: { status: 'healthy' },
      timestamp: new Date(),
    });
  });

  // Routes
  app.use('/api/files', fileRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
      timestamp: new Date(),
    });
  });

  // Error handler middleware (before 404 handler)
  app.use(
    (err: unknown, req: Request, res: Response, _next: NextFunction) => {
      const errorResponse = getErrorResponse(err);

      logger.error(`Error on ${req.method} ${req.path}`, err);

      res.status(errorResponse.statusCode).json({
        success: false,
        error: {
          code: errorResponse.code,
          message: errorResponse.message,
        },
        timestamp: new Date(),
      });
    }
  );

  return app;
};

export const initializeApp = createApp;
