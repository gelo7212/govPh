import { Request, Response } from 'express';
import { AdminFileAggregator } from './file.aggregator';
import { handleServiceError, sendErrorResponse, UploadFileRequest } from '@gov-ph/bff-core';
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
   * GET /api/files/:fileId/metadata
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
   * GET /api/files/:fileId/download
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

  async downloadFileById(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      if (!fileId) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'File ID is required');
        return;
      }
      const token = req.headers.authorization;
      if(!token) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', 'Authorization token is required');
        return;
      }
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

  /**
   * POST upload file
   */
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'No file uploaded');
        return;
      }
      const token = req.headers.authorization || '';

      const uploadRequest : UploadFileRequest = {
        buffer: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        ownerType: req.body.ownerType,
        ownerId: req.body.ownerId,
        uploadedBy: req.body.uploadedBy,
        visibility: req.body.visibility,
        expiresAt: undefined,
      };

      const result = await this.aggregator.uploadFile(uploadRequest, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to upload file');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
}