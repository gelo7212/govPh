import { Router } from 'express';
import { AdminFileController } from './file.controller';
import { AdminFileAggregator } from './file.aggregator';
import { FileServiceClient } from '@gov-ph/bff-core';
import { authContextMiddleware } from '../../middlewares/authContext';
import { requireRole } from '../../middlewares/requireRole';

export const fileRoutes = Router();

// Initialize dependencies
const fileClient = new FileServiceClient(
  process.env.FILE_SERVICE_URL || 'http://govph-file-management-service:3000'
);
const fileAggregator = new AdminFileAggregator(fileClient);
const fileController = new AdminFileController(fileAggregator);

// Middleware: Require authentication and admin role
fileRoutes.use(authContextMiddleware);
fileRoutes.use(requireRole('APP_ADMIN', 'SOS_ADMIN', 'SK_ADMIN', 'CITY_ADMIN'));

// ==================== FILE METADATA & DOWNLOAD ====================

/**
 * Get file metadata
 * GET /api/admin/files/:fileId/metadata
 */
fileRoutes.get('/:fileId/metadata', (req, res) =>
  fileController.getFileMetadata(req, res)
);

/**
 * Get file download URL
 * GET /api/files/:fileId/download
 */
fileRoutes.get('/:fileId/download', (req, res) =>
  fileController.downloadFileById(req, res)
);
  

/**
 * List all files
 * GET /api/admin/files
 */
fileRoutes.get('/', (req, res) =>
  fileController.listFiles(req, res)
);

export default fileRoutes;
