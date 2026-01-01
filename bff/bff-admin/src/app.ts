import express, { Express } from 'express';
import { identityRoutes } from './modules/identity/identity.routes';
import { sosRoutes } from './modules/sos/sos.routes';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Admin routes with role protection
  app.use('/api/identity',  identityRoutes);
  app.use('/api/sos', sosRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'bff-admin' });
  });

  return app;
}
