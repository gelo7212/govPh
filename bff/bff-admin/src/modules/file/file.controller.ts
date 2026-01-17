import { Request, Response } from 'express';
import { AdminFileAggregator } from './file.aggregator';
import { handleServiceError, sendErrorResponse } from '@gov-ph/bff-core';
import { ListFilesFilters } from './file.types';

/**
 * Admin File Controller
 * Handles file metadata viewing and download requests
 */
export class AdminFileController {
  private aggregator: AdminFileAggregator;

  constructor(aggregator: AdminFileAggregator) {
    this.aggregator = aggregator;
  }

  /**
   * GET /api/admin/files/:fileId/metadata
   * Get file metadata by ID
   */
  async getFileMetadata(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'File ID is required');
        return;
      }

      const token = req.headers.authorization;
      const result = await this.aggregator.getFileMetadata(fileId, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch file metadata');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * GET /api/admin/files/:fileId/download
   * Get download URL for a file
   */
  async getFileDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'File ID is required');
        return;
      }

      const token = req.headers.authorization;
      const result = await this.aggregator.getFileDownloadUrl(fileId, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to generate download URL');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * GET /api/admin/files
   * List files with optional filters
   */
  async listFiles(req: Request, res: Response): Promise<void> {
    try {
      const filters: ListFilesFilters = {
        submissionId: req.query.submissionId as string | undefined,
        incidentId: req.query.incidentId as string | undefined,
        uploadedBy: req.query.uploadedBy as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const token = req.headers.authorization;
      const result = await this.aggregator.listFiles(filters, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch file list');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
  
  
  async downloadFileById(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      if (!fileId) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'File ID is required');
        return;
      }
      const token = req.headers.authorization;
      const fileData = await this.aggregator.downloadFileById(fileId, token);
      if(!fileData) {
        sendErrorResponse(res, 404, 'FILE_NOT_FOUND', 'File not found');
        return;
      }

      res.setHeader('Content-Disposition', `attachment; filename="${fileData.fileName}"`);
      res.setHeader('Content-Type', fileData.mimeType);
      res.send(fileData.fileBuffer);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to download file');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
}
