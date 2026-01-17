/**
 * Drafts Controller
 * Handles draft submission endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { DraftsService } from './drafts.service';
import { ApiResponse } from '../../types';
import { IDraft } from './drafts.mongo.schema';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DraftsController');

export class DraftsController {
  private draftsService: DraftsService;

  constructor() {
    this.draftsService = new DraftsService();
  }

  /**
   * GET /api/drafts
   * List drafts with optional filtering
   */
  async getAllDrafts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { schemaId, skip = 0, limit = 20} = req.query;

      const { id: createdBy } = req.context?.user || {};

      logger.debug(`Fetching drafts - schema: ${schemaId}`);

      const drafts = await this.draftsService.getAllDrafts(
        schemaId as string | undefined,
        parseInt(skip as string),
        parseInt(limit as string),
        createdBy as string | undefined
      );

      res.status(200).json({
        success: true,
        data: drafts,
        timestamp: new Date(),
      } as ApiResponse<any>);
    } catch (error) {
      logger.error('Failed to get all drafts', error);
      next(error);
    }
  }

  /**
   * GET /api/drafts/:id
   * Get specific draft by ID
   */
  async getDraftById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { id: createdBy } = req.context?.user || {};

      logger.debug(`Getting draft: ${id}`);

      const draft = await this.draftsService.getDraftById(id, createdBy as string);
      res.status(200).json({
        success: true,
        data: draft,
        timestamp: new Date(),
      } as ApiResponse<IDraft>);
    } catch (error) {
      logger.error(`Failed to get draft ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * POST /api/drafts
   * Save draft (create or update)
   */
  async saveDraft(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { schemaId, formKey, data } = req.body;

      const { id: createdBy, id: updatedBy } = req.context?.user || {};

      logger.debug(`Saving draft for schema: ${schemaId}`);

      const draft = await this.draftsService.saveDraft({
        schemaId,
        formKey,
        data,
        createdBy: req.context?.user?.id ?? createdBy,
        updatedBy: req.context?.user?.id ?? updatedBy,
      });

      res.status(201).json({
        success: true,
        data: draft,
        timestamp: new Date(),
      } as ApiResponse<IDraft>);
    } catch (error) {
      logger.error('Failed to save draft', error);
      next(error);
    }
  }

  /**
   * PUT /api/drafts/:id
   * Update draft
   */
  async updateDraft(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { data } = req.body;
      const { id: updatedBy } = req.context?.user || {};
      logger.debug(`Updating draft: ${id}`);

      const draft = await this.draftsService.updateDraft(id, {
        data,
        updatedBy: req.context?.user?.id ?? updatedBy,
      });

      res.status(200).json({
        success: true,
        data: draft,
        timestamp: new Date(),
      } as ApiResponse<IDraft>);
    } catch (error) {
      logger.error(`Failed to update draft ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * DELETE /api/drafts/:id
   * Delete draft
   */
  async deleteDraft(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const { id: createdBy } = req.context?.user || {};
      logger.debug(`Deleting draft: ${id}`);

      await this.draftsService.deleteDraft(id, createdBy as string);

      res.status(200).json({
        success: true,
        data: { id },
        timestamp: new Date(),
      } as ApiResponse<any>);
    } catch (error) {
      logger.error(`Failed to delete draft ${req.params.id}`, error);
      next(error);
    }
  }
}
