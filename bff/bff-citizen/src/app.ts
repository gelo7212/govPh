import express, { Express } from 'express';
import { identityRoutes } from './modules/identity/identity.routes';
import { sosRoutes } from './modules/sos/sos.routes';
import { geoRoutes } from './modules/geo/geo.routes';
import { incidentRoutes} from './modules/incident/incident.routes';

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

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'bff-citizen' });
  });

  return app;
}
