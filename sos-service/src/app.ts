import express, { Express } from 'express';
import cors from 'cors';
// import { setupWebSocket } from './config/socket';
import { roleGuard } from './middleware/roleGuard';

// Import routes
import sosRoutes from './modules/sos/sos.routes';
import rescuerRoutes from './modules/rescuer/rescuer.routes';
import dispatchRoutes from './modules/dispatch/dispatch.routes';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Role guard middleware - validates trusted headers
app.use(roleGuard);

// Routes
app.use('/api/sos', sosRoutes);
app.use('/api/rescuer', rescuerRoutes);
app.use('/api/internal/dispatch', dispatchRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', service: 'sos-service' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;
