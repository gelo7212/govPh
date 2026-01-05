import express, { Express } from 'express';
import { identityRoutes } from './modules/identity/identity.routes';
import { sosRoutes } from './modules/sos/sos.routes';
import { cityRoutes } from './modules/city/city.routes';
import { geoRoutes } from './modules/geo/geo.routes';
import { inviteRoutes } from './modules/invite/invite.routes';
import { incidentRoutes } from './modules/incident/incident.routes';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Admin routes with role protection
  app.use('/api/identity',  identityRoutes);
  app.use('/api/sos', sosRoutes);
  app.use('/api/admin/cities', cityRoutes);
  app.use('/api/geo', geoRoutes);
  app.use('/api/invites', inviteRoutes);
  app.use('/api/incidents', incidentRoutes);
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'bff-admin' });
  });

  return app;
}
