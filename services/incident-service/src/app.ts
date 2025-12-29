import express, { Express, Request, Response, NextFunction } from 'express';
import { connectMongoDB } from './config/database';
import { RequestUser, ApiResponse } from './types';
import { getErrorResponse } from './errors';
import { createLogger } from './utils/logger';
import incidentRoutes from './modules/incidents/incident.routes';
import assignmentRoutes from './modules/assignments/assignment.routes';
import incidentTimeline from './modules/incident-timelines/incident-timeline.routes';

const logger = createLogger('App');

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Firebase authentication middleware (simplified)
  // In production, verify Firebase token here
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      (req as any).user = {
        userId: `user_${token.substring(0, 8)}`,
        firebaseUid: token,
        role: 'citizen',
      };
    }
    next();
  });

  // Routes
  app.use('/incidents', incidentRoutes);
  app.use('/assignments', assignmentRoutes);
  app.use('/incident-timelines', incidentTimeline);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'incident-ms' });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    });
  });

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error', err);
    const errorResponse = getErrorResponse(err);
    res.status(errorResponse.statusCode).json(errorResponse);
  });

  return app;
};

export const initializeApp = async (): Promise<Express> => {
  try {
    await connectMongoDB();
    const app = createApp();
    return app;
  } catch (error) {
    logger.error('Failed to initialize app', error);
    throw error;
  }
};
