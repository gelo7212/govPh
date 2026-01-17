import express, { Express, NextFunction, Request, Response } from 'express';
import { identityRoutes } from './modules/identity/identity.routes';
import { sosRoutes } from './modules/sos/sos.routes';
import { geoRoutes } from './modules/geo/geo.routes';
import { incidentRoutes} from './modules/incident/incident.routes';
import { getErrorResponse } from './error';
import { createLogger } from './utils/logger';
import { cityRoutes } from './modules/city/city.routes';
import { evacuationRoutes } from './modules/evacuation/evacuation.routes';
import { submissionRoutes } from './modules/submission/submission.routes';
import fileRoutes from './modules/file/file.routes';


const logger = createLogger('Validators');

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  // app.use(express.urlencoded({ extended: true }));

  // logging middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`Incoming request: ${req.method} ${req.path}`, {
      query: req.query,
      params: req.params,
    });
    next();
  });
  
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/identity', identityRoutes);
  app.use('/api/sos', sosRoutes);
  app.use('/api/geo', geoRoutes);
  app.use('/api/cities', cityRoutes);
  app.use('/api/evacuation-centers', evacuationRoutes);
  app.use('/api/forms', submissionRoutes);
  app.use('/api/files', fileRoutes);
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'bff-citizen' });
  });

  // Error handling middleware
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const errorResponse = getErrorResponse(err);
    logger.error('Error handler invoked', { error: errorResponse });
  
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

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
      timestamp: new Date(),
    });
  });

  return app;
}
