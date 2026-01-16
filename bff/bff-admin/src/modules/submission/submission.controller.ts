import { Request, Response } from 'express';
import { AdminSubmissionAggregator } from './submission.aggregator';
import { handleServiceError, SchemaStatus, sendErrorResponse, SubmissionStatus } from '@gov-ph/bff-core';
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
   * GET /api/admin/forms/schemas
   * Get all form schemas
   */
  async getAllSchemas(req: Request, res: Response): Promise<void> {
    try {
      const filters: ListSchemasFilters = {
        status: req.query.status as SchemaStatus | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const token = req.headers.authorization;
      const result = await this.aggregator.getAllSchemas(filters, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch form schemas');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

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

  /**
   * POST /api/admin/forms/schemas
   * Create new form schema
   */
  async createSchema(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateFormSchemaRequest = req.body;
      const token = req.headers.authorization;

      const result = await this.aggregator.createSchema(data, token);
      res.status(201).json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to create form schema');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * PUT /api/admin/forms/schemas/:schemaId
   * Update form schema
   */
  async updateSchema(req: Request, res: Response): Promise<void> {
    try {
      const { schemaId } = req.params;
      const data: UpdateFormSchemaRequest = req.body;
      const token = req.headers.authorization;

      const result = await this.aggregator.updateSchema(schemaId, data, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update form schema');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * DELETE /api/admin/forms/schemas/:schemaId
   * Delete form schema
   */
  async deleteSchema(req: Request, res: Response): Promise<void> {
    try {
      const { schemaId } = req.params;
      const token = req.headers.authorization;

      const result = await this.aggregator.deleteSchema(schemaId, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to delete form schema');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * POST /api/admin/forms/schemas/:schemaId/publish
   * Publish form schema
   */
  async publishSchema(req: Request, res: Response): Promise<void> {
    try {
      const { schemaId } = req.params;
      const token = req.headers.authorization;

      const result = await this.aggregator.publishSchema(schemaId, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to publish form schema');
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
   * GET /api/admin/forms/submissions/stats
   * Get submission statistics for dashboard
   */
  async getSubmissionStats(req: Request, res: Response): Promise<void> {
    try {
      const filters: ListSubmissionsFilters = {
        schemaId: req.query.schemaId as string | undefined,
        status: req.query.status as SubmissionStatus | undefined,
      };

      const token = req.headers.authorization;
      const stats = await this.aggregator.getSubmissionStats(filters, token);
      res.json(stats);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch submission statistics');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * PUT /api/admin/forms/submissions/:submissionId/status
   * Update submission status (REVIEWED, APPROVED, REJECTED)
   */
  async updateSubmissionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId } = req.params;
      const { status, notes } = req.body;
      const token = req.headers.authorization;

      if (!['REVIEWED', 'APPROVED', 'REJECTED'].includes(status)) {
        sendErrorResponse(res, 400, 'INVALID_STATUS', 'Invalid submission status');
        return;
      }

      const result = await this.aggregator.updateSubmissionStatus(
        submissionId,
        status,
        notes,
        token
      );
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to update submission status');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * DELETE /api/admin/forms/submissions/:submissionId
   * Delete submission
   */
  async deleteSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId } = req.params;
      const token = req.headers.authorization;

      const result = await this.aggregator.deleteSubmission(submissionId, token);
      res.json(result);
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to delete submission');
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
}
