import express, { Express, Request, Response, NextFunction } from 'express';
import { connectMongoDB } from './config/database';
import { RequestUser, ApiResponse } from './types';
import { getErrorResponse } from './errors';
import { createLogger } from './utils/logger';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import adminRoutes from './modules/admin/admin.routes';
import rescuerRoutes from './modules/rescuer/rescuer.routes';
import { smsRoutes } from './modules/sms';
import inviteRoutes from './modules/invite/invite.routes';
import { requestLogger } from './middlewares/requestLogger.middleware';

const logger = createLogger('App');

export const createApp = (): Express => {
  const app = express();

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

  // Routes - Register all routes first
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/admin', adminRoutes);
  app.use('/rescuer', rescuerRoutes);
  app.use('/sms', smsRoutes);
  app.use('/invites', inviteRoutes);

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

  // 404 handler (last middleware)
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
      },
      timestamp: new Date(),
    });
  });

  return app;
};

/**
 * Initialize the application
 */
export const initializeApp = async (): Promise<Express> => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    logger.info('Database connection established');

    // Create and return Express app
    const app = createApp();
    logger.info('Application initialized successfully');

    return app;
  } catch (error) {
    logger.error('Failed to initialize application', error);
    throw error;
  }
};
