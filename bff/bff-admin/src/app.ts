import express, { Express, Request, Response, NextFunction } from 'express';
import qs from 'qs';
import { identityRoutes } from './modules/identity/identity.routes';
import { sosRoutes } from './modules/sos/sos.routes';
import { cityRoutes } from './modules/city/city.routes';
import { geoRoutes } from './modules/geo/geo.routes';
import { inviteRoutes } from './modules/invite/invite.routes';
import { incidentRoutes } from './modules/incident/incident.routes';
import { evacuationRoutes } from './modules/evacuation/evacuation.routes';
import deptTrackingRoutes from './modules/dept-tracking/dept-tracking.routes';
import { submissionRoutes } from './modules/submission/submission.routes';
import { requestLogger } from './middlewares/requestLogger';


export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Configure query parser for nested objects
  app.set('query parser', (str: string) => qs.parse(str, { 
    allowPrototypes: true,
    depth: 10 
  }));
  
  // Request logging middleware
  app.use(requestLogger);

  // Admin routes with role protection
  app.use('/api/identity',  identityRoutes);
  app.use('/api/sos', sosRoutes);
  app.use('/api/admin/cities', cityRoutes);
  app.use('/api/cities/evacuation-centers', evacuationRoutes);
  app.use('/api/geo', geoRoutes);
  app.use('/api/invites', inviteRoutes);
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/sharelink', deptTrackingRoutes);
  app.use('/api/admin/forms', submissionRoutes);
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'bff-admin' });
  });

  return app;
}
