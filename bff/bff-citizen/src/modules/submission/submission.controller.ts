import { NextFunction, Request, Response } from 'express';
import { AdminSubmissionAggregator } from './submission.aggregator';
import { handleServiceError, SchemaStatus, sendErrorResponse, SubmissionStatus } from '@gov-ph/bff-core';
import { extname } from 'path';
import {
  CreateFormSchemaRequest,
  UpdateFormSchemaRequest,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  ListSchemasFilters,
  ListSubmissionsFilters,
  ListDraftsFilters,
} from '@gov-ph/bff-core';

/**
 * Admin Submission Controller
 * Handles form schema management, submission review, and draft management
 */
export class AdminSubmissionController {
  private aggregator: AdminSubmissionAggregator;

  constructor(aggregator: AdminSubmissionAggregator) {
    this.aggregator = aggregator;
  }

  // ==================== SCHEMAS ====================

  /**
   * GET /api/admin/forms/schemas/:schemaId
   * Get schema by ID
   */
  async getSchemaById(req: Request, res: Response): Promise<void> {
    try {
      const { schemaId } = req.params;
      const token = req.headers.authorization;

      const result = await this.aggregator.getSchemaById(schemaId, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch form schema');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
  // ==================== SUBMISSIONS ====================

  /**
   * GET /api/admin/forms/submissions
   * Get all submissions for review
   */
  async getAllSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const filters: ListSubmissionsFilters = {
        schemaId: req.query.schemaId as string | undefined,
        status: req.query.status as SubmissionStatus | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const token = req.headers.authorization;
      const result = await this.aggregator.getAllSubmissions(filters, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch submissions');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * GET /api/admin/forms/submissions/:submissionId
   * Get submission by ID
   */
  async getSubmissionById(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId } = req.params;
      const token = req.headers.authorization;

      const result = await this.aggregator.getSubmissionByIdWithContext(
        submissionId,
        token
      );
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch submission');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * POST /api/forms/submissions
   * Submit a new submission
  */
  async submitSubmission(req: Request, res: Response): Promise<void> {
    try {
      const submissionData = req.body;
      const token = req.headers.authorization;
      const result = await this.aggregator.submitSubmission(submissionData, token);
      res.status(201).json(result);
    }catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to submit submission');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);

    }
  }

  // ==================== DRAFTS ====================

  /**
   * GET /api/admin/forms/drafts
   * Get all drafts
   */
  async getAllDrafts(req: Request, res: Response): Promise<void> {
    try {
      const filters: ListDraftsFilters = {
        schemaId: req.query.schemaId as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const token = req.headers.authorization;
      const result = await this.aggregator.getAllDrafts(filters, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch drafts');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async saveDraft(req: Request, res: Response): Promise<void> {
    try {
      const draftData = req.body;
      const token = req.headers.authorization;
      const result = await this.aggregator.saveDraft(draftData, token);
      res.status(201).json(result);
    }
    catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to save draft');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * GET /api/admin/forms/drafts/:draftId
   * Get draft by ID
   */
  async getDraftById(req: Request, res: Response): Promise<void> {
    try {
      const { draftId } = req.params;
      const token = req.headers.authorization;

      const result = await this.aggregator.getDraftById(draftId, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch draft');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * DELETE /api/admin/forms/drafts/:draftId
   * Delete draft
   */
  async deleteDraft(req: Request, res: Response): Promise<void> {
    try {
      const { draftId } = req.params;
      const token = req.headers.authorization;

      const result = await this.aggregator.deleteDraft(draftId, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to delete draft');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  // ==================== VALIDATIONS ====================

  /**
   * POST /api/admin/forms/validate
   * Validate form data
   */
  async validateFormData(req: Request, res: Response): Promise<void> {
    try {
      const { schemaId, formKey, data } = req.body;
      const token = req.headers.authorization;

      const result = await this.aggregator.validateFormData(
        { schemaId, data },
        token
      );
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to validate form data');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
  
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        sendErrorResponse(res, 400, 'NO_FILE', 'No file uploaded');
        return;
      }
      const token = req.headers.authorization;
      const draftId = req.body.draftId;
      const schemaId = req.body.schemaId;
      const formKey = req.body.formKey;
      const fieldId = req.body.fieldId;

      if (!draftId || !schemaId || !formKey) {
        sendErrorResponse(res, 400, 'MISSING_FIELDS', 'Missing required fields: draftId, schemaId, formKey');
        return;
      }
      const mimeType = req.file.mimetype || 'application/octet-stream';

      let draftData =  {} as {
        _id?: string;
        schemaId: string;
        formKey: string;
        data: Record<string, any>;
        createdAt?: Date;
        createdBy?: string;
        updatedAt?: Date;
        updatedBy?: string;
        expiresAt?: Date;
        __v?: number;
      };

      console.log('Uploading file for draftId:', draftId, 'schemaId:', schemaId, 'formKey:', formKey);

      const draft = await this.aggregator.getDraftById(draftId, token);
      if (draft) {
        draftData = draft.data;
      }
      else{
        draftData = {
          schemaId: schemaId,
          formKey: formKey,
          data: {},
        };
      }

      delete draftData.createdAt;
      delete draftData.createdBy;
      delete draftData.updatedAt;
      delete draftData.updatedBy;
      delete draftData.expiresAt;
      delete draftData.__v;
      delete draftData._id;
      // Convert multer file to the expected format if necessary fileBuffer: Buffer<ArrayBufferLike>
      const fileBuffer = Buffer.from(req.file.buffer);
      const result = await this.aggregator.uploadFile(
        fileBuffer, req.file.originalname, mimeType,
        token, req.context?.user?.userId || req.context?.user?.id || '' 
      );

      draftData.data[fieldId] = result?.fileId || '';

      await this.aggregator.saveDraft(draftData, token);
      res.status(201).json({
        success: true,
        data: result,
      });
    }
    catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to upload file');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
      // next(error);
    }
  }
}
