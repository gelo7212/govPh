import { Router } from 'express';
import { AdminFileController } from './file.controller';
import { AdminFileAggregator } from './file.aggregator';
import { FileServiceClient } from '@gov-ph/bff-core';
import { authContextMiddleware } from '../../middlewares/authContext';

export const fileRoutes = Router();

// Initialize dependencies
const fileClient = new FileServiceClient(
  process.env.FILE_SERVICE_URL || 'http://govph-file-management-service:3000'
);
const fileAggregator = new AdminFileAggregator(fileClient);
const fileController = new AdminFileController(fileAggregator);

// Middleware: Require authentication
fileRoutes.use(authContextMiddleware);

// ==================== FILE METADATA & DOWNLOAD ====================

/**
 * Get file metadata
 * GET /api/files/:fileId/metadata
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

export default fileRoutes;
