import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorHandler';
import boundariesRoutes from './modules/boundaries/boundaries.routes';
import reverseGeocodingRoutes from './modules/reverse-geocoding/reverse-geocoding.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMessage = `${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.warn(logMessage, {
        query: req.query,
        params: req.params,
        body: req.body,
      });
    } else {
      logger.info(logMessage, {
        query: req.query,
        params: req.params,
      });
    }
  });
  
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Geo Service is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/geo/boundaries', boundariesRoutes);
app.use('/geo/reverse-geocode', reverseGeocodingRoutes);

// Error handling middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
