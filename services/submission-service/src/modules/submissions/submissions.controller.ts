/**
 * Submissions Controller
 * Handles form submission endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { SubmissionsService } from './submissions.service';
import { ApiResponse } from '../../types';
import { ISubmission } from './submissions.mongo.schema';
import { createLogger } from '../../utils/logger';
import { DraftsService } from '../drafts';

const logger = createLogger('SubmissionsController');

export class SubmissionsController {
  private submissionsService: SubmissionsService;
  private draftService: DraftsService;

  constructor() {
    this.submissionsService = new SubmissionsService();
    this.draftService = new DraftsService();
  }

  /**
   * GET /api/submissions
   * List submissions with optional filtering
   */
  async getAllSubmissions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { schemaId, status, skip = 0, limit = 20 } = req.query;

      logger.debug(`Fetching submissions - schema: ${schemaId}, status: ${status}`);

      const submissions = await this.submissionsService.getAllSubmissions(
        schemaId as string | undefined,
        status as string | undefined,
        parseInt(skip as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: submissions,
        timestamp: new Date(),
      } as ApiResponse<any>);
    } catch (error) {
      logger.error('Failed to get all submissions', error);
      next(error);
    }
  }

  /**
   * GET /api/submissions/:id
   * Get specific submission by ID
   */
  async getSubmissionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      logger.debug(`Getting submission: ${id}`);

      const submission = await this.submissionsService.getSubmissionById(id);

      res.status(200).json({
        success: true,
        data: submission,
        timestamp: new Date(),
      } as ApiResponse<ISubmission>);
    } catch (error) {
      logger.error(`Failed to get submission ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * POST /api/submissions
   * Create new form submission
   */
  async createSubmission(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { schemaId, formKey, data } = req.body;

      logger.debug(`Creating submission for schema: ${schemaId}`);

      if(req.context?.user?.id === undefined) {
        throw new Error('User context is missing');
      }

      const submission = await this.submissionsService.createSubmission({
        schemaId,
        formKey,
        data,
        createdBy: req.context?.user?.id,
      });

      
      // delete draft using createdBy and schemaId
      await this.draftService.deleteDraftBySchemaAndUser(
        schemaId,
        req.context?.user?.id || ''
      );

      res.status(201).json({
        success: true,
        data: submission,
        timestamp: new Date(),
      } as ApiResponse<ISubmission>);
    } catch (error) {
      logger.error('Failed to create submission', error);
      next(error);
    }
  }

  /**
   * PUT /api/submissions/:id
   * Update form submission
   */
  async updateSubmission(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status, data, notes } = req.body;

      logger.debug(`Updating submission: ${id}`);

      const submission = await this.submissionsService.updateSubmission(id, {
        status,
        data,
        notes,
        updatedBy: req.context?.user?.id,
      });

      res.status(200).json({
        success: true,
        data: submission,
        timestamp: new Date(),
      } as ApiResponse<ISubmission>);
    } catch (error) {
      logger.error(`Failed to update submission ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * DELETE /api/submissions/:id
   * Delete form submission
   */
  async deleteSubmission(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      logger.debug(`Deleting submission: ${id}`);

      await this.submissionsService.deleteSubmission(id);

      res.status(200).json({
        success: true,
        data: { id },
        timestamp: new Date(),
      } as ApiResponse<any>);
    } catch (error) {
      logger.error(`Failed to delete submission ${req.params.id}`, error);
      next(error);
    }
  }
}
