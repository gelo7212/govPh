import express, { Express, NextFunction, Request, Response } from 'express';
import { identityRoutes } from './modules/identity/identity.routes';
import { sosRoutes } from './modules/sos/sos.routes';
import { geoRoutes } from './modules/geo/geo.routes';
import { incidentRoutes} from './modules/incident/incident.routes';
import { getErrorResponse } from './error';
import { createLogger } from './utils/logger';
import { cityRoutes } from './modules/city/city.routes';


const logger = createLogger('Validators');

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/identity', identityRoutes);
  app.use('/api/sos', sosRoutes);
  app.use('/api/geo', geoRoutes);
  app.use('/api/cities', cityRoutes);
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

  return app;
}
