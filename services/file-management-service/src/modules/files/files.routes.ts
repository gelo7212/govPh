import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { fileService } from './files.service';
import { validateAuth } from '../../middlewares/auth.middleware';
import { ValidationError, NotFoundError } from '../../errors';
import { createLogger } from '../../utils/logger';
import { OwnerType } from '../../types';

const router = Router();
const logger = createLogger('FileRoutes');

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB default
  },
});

/**
 * POST /api/files/upload
 * Upload a new file
 */
router.post(
  '/upload',
  validateAuth,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new ValidationError('No file provided');
      }

      const { ownerType, ownerId, visibility, expiresAt } = req.body;
      const userId = (req as any).user?.id;

      // Validation
      if (!ownerType || !ownerId || !userId) {
        throw new ValidationError('Missing required fields: ownerType, ownerId');
      }

      const validOwnerTypes: OwnerType[] = ['INCIDENT', 'USER', 'DEPARTMENT', 'CITY', 'FOI'];
      if (!validOwnerTypes.includes(ownerType)) {
        throw new ValidationError(`Invalid ownerType. Must be one of: ${validOwnerTypes.join(', ')}`);
      }

      const uploadResponse = await fileService.uploadFile({
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer,
        ownerType,
        ownerId,
        visibility: visibility || 'PRIVATE',
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        uploadedBy: userId,
      });

      res.status(201).json({
        success: true,
        data: uploadResponse,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/files/:fileId
 * Get file metadata
 */
router.get(
  '/:fileId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileId } = req.params;
      const file = await fileService.getFile(fileId);

      res.status(200).json({
        success: true,
        data: file,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/files/:fileId/download
 * Download a file
 */
router.get(
  '/:fileId/download',
  validateAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileId } = req.params;
      const userId = (req as any).user?.id;

      const file = await fileService.getFile(fileId);
      const buffer = await fileService.downloadFile(fileId, userId);

      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/files
 * List files with filters
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ownerType, ownerId, visibility, limit, skip } = req.query;

      const result = await fileService.listFiles({
        ownerType: ownerType as any,
        ownerId: ownerId as string,
        visibility: visibility as any,
        limit: limit ? parseInt(limit as string) : undefined,
        skip: skip ? parseInt(skip as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/files/:fileId
 * Delete a file
 */
router.delete(
  '/:fileId',
  validateAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileId } = req.params;
      const userId = (req as any).user?.id;

      await fileService.deleteFile(fileId, userId);

      res.status(200).json({
        success: true,
        data: { deleted: true },
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
