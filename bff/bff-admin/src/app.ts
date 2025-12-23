import express, { Express } from 'express';
import { requireRoleMiddleware } from './middlewares/requireRole';
import { authContextMiddleware } from './middlewares/authContext';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(authContextMiddleware);

  // Admin routes with role protection
  app.use('/api/admin', requireRoleMiddleware(['admin']), (req, res) => {
    res.json({ message: 'Admin routes' });
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'bff-admin' });
  });

  return app;
}
