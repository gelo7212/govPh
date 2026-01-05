import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CitySchema } from './modules/cities/city.schema';
import { DepartmentSchema } from './modules/departments/department.schema';
import { SosHQSchema } from './modules/sos-hq/sos-hq.schema';
import { CityConfigSchema } from './modules/city-config/city-config.schema';
import cityRouter from './modules/cities/city.routes';
import departmentRouter from './modules/departments/department.routes';
import sosHQRouter from './modules/sos-hq/sos-hq.routes';
import cityConfigRouter from './modules/city-config/city-config.routes';
import { departmentController } from './modules/departments/index';
import { sosHQController } from './modules/sos-hq/index';
import { requestContext } from './middlewares/auth';
import { logger } from './utils/logger';

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestContext);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'city-service',
    timestamp: new Date().toISOString(),
  });
});

// Initialize models
mongoose.model('City', CitySchema);
mongoose.model('Department', DepartmentSchema);
mongoose.model('SosHQ', SosHQSchema);
mongoose.model('CityConfig', CityConfigSchema);

// Initialize database and routes
export const initializeApp = async (): Promise<Express> => {
  // Register routes
  app.use('/api/cities', cityRouter);
  app.use('/api/departments', departmentRouter);
  app.use('/api/sos-hq', sosHQRouter);
  app.use('/api/city-configs', cityConfigRouter);

  // City-specific routes
  app.get('/api/cities/:cityCode/departments', (req: Request, res: Response) => {
    departmentController.getByCity(req, res);
  });

  app.get('/api/cities/:cityCode/sos-hq', (req: Request, res: Response) => {
    sosHQController.getByCity(req, res);
  });

  // Province routes
  app.get('/api/provinces/:provinceCode/sos-hq', (req: Request, res: Response) => {
    sosHQController.getByProvince(req, res);
  });

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger(`Error: ${err.message}`, 'error');
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  return app;
}

export default app;
