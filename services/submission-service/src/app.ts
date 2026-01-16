import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectMongoDB } from './config/database';
import { ApiResponse } from './types';
import { getErrorResponse } from './errors';
import { createLogger } from './utils/logger';
import { requestLogger } from './middlewares/requestLogger.middleware';

// Import routes
import schemaRoutes from './modules/schemas/schemas.routes';
import submissionRoutes from './modules/submissions/submissions.routes';
import draftRoutes from './modules/drafts/drafts.routes';
import validationRoutes from './modules/validations/validations.routes';

const logger = createLogger('App');

export const initializeApp = async (): Promise<Express> => {
  const app = express();

  // Connect to MongoDB
  await connectMongoDB();

  // Middleware
  app.use(cors());
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
    } as ApiResponse<{ status: string }>);
  });

  // API Routes
  app.use('/api/schemas', schemaRoutes);
  app.use('/api/submissions', submissionRoutes);
  app.use('/api/drafts', draftRoutes);
  app.use('/api/validations', validationRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
      },
      timestamp: new Date(),
    } as ApiResponse<null>);
  });

  // Error handler middleware (should be last)
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
      } as ApiResponse<null>);
    }
  );

  return app;
};
