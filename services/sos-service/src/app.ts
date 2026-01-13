import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { roleGuard } from './middleware/roleGuard';
import { getErrorResponse } from './errors';
import { createLogger } from './utils/logger';

// Import routes
import sosRoutes from './modules/sos/sos.routes';
import rescuerRoutes from './modules/rescuer/rescuer.routes';
import dispatchRoutes from './modules/dispatch/dispatch.routes';
import messageRoutes from './modules/messages/message.routes';
import participantRoutes from './modules/sos_participants/participant.routes';

// Import event handlers and services
import { SOSEventHandlers } from './modules/sos/sos.event-handlers';
import { MessageService } from './modules/messages';
import { MessageRepository } from './modules/messages';

const logger = createLogger('App');

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Role guard middleware - validates trusted headers
app.use(roleGuard);
// Routes
app.use('/api/sos', sosRoutes);
app.use('/api/sos/:sosId/messages', messageRoutes);
app.use('/api/rescuer', rescuerRoutes);
app.use('/api/internal/dispatch', dispatchRoutes);
app.use('/api/sos/:sosId/participants', participantRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'OK', service: 'sos-service' },
    timestamp: new Date(),
  });
});

// Error handler middleware (before 404 handler)
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
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
});

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

export default app;
