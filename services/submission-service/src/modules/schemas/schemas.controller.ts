/**
 * Schemas Controller
 * Handles form schema management endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { SchemasService } from './schemas.service';
import { ApiResponse } from '../../types';
import { IFormSchema } from './schemas.mongo.schema';
import { createLogger } from '../../utils/logger';

const logger = createLogger('SchemasController');

export class SchemasController {
  private schemasService: SchemasService;

  constructor() {
    this.schemasService = new SchemasService();
  }

  /**
   * GET /api/schemas
   * List all form schemas with optional filtering
   */
  async getAllSchemas(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId,status, skip = 0, limit = 20 } = req.query;

      const schemas = await this.schemasService.getAllSchemas(
        userId as string | undefined,
        status as string | undefined,
        parseInt(skip as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: schemas,
        timestamp: new Date(),
      } as ApiResponse<any>);
    } catch (error) {
      logger.error('Failed to get all schemas', error);
      next(error);
    }
  }

  /**
   * GET /api/schemas/:id
   * Get specific form schema by ID
   */
  async getSchemaById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      logger.debug(`Getting schema: ${id}`);

      const schema = await this.schemasService.getSchemaById(id);

      res.status(200).json({
        success: true,
        data: schema,
        timestamp: new Date(),
      } as ApiResponse<IFormSchema>);
    } catch (error) {
      logger.error(`Failed to get schema ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * POST /api/schemas
   * Create new form schema
   */
  async createSchema(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { formKey, title, description, fields } = req.body;

      logger.debug(`Creating schema: ${formKey}`);

      const schema = await this.schemasService.createSchema({
        formKey,
        title,
        description,
        fields: fields || [],
        createdBy: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data: schema,
        timestamp: new Date(),
      } as ApiResponse<IFormSchema>);
    } catch (error) {
      logger.error('Failed to create schema', error);
      next(error);
    }
  }
  
  

  /**
   * PUT /api/schemas/:id
   * Update existing form schema
   */
  async updateSchema(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, fields } = req.body;

      logger.debug(`Updating schema: ${id}`);
      // prevent updating schema when published
      const existingSchema = await this.schemasService.getSchemaById(id);
      if (existingSchema.status === 'PUBLISHED') {
        res.status(400).json({
            success: false,
            error: 'Cannot update a published schema',
          });
          return;
      }

      const schema = await this.schemasService.updateSchema(id, {
        title,
        description,
        fields,
        updatedBy: req.user?.id,
        formKey: req.body.formKey,
      });

      res.status(200).json({
        success: true,
        data: schema,
        timestamp: new Date(),
      } as ApiResponse<IFormSchema>);
    } catch (error) {
      logger.error(`Failed to update schema ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * DELETE /api/schemas/:id
   * Delete form schema
   */
  async deleteSchema(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      logger.debug(`Deleting schema: ${id}`);

      await this.schemasService.deleteSchema(id);

      res.status(200).json({
        success: true,
        data: { id },
        timestamp: new Date(),
      } as ApiResponse<any>);
    } catch (error) {
      logger.error(`Failed to delete schema ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * POST /api/schemas/:id/publish
   * Publish form schema (make it immutable)
   */
  async publishSchema(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      logger.debug(`Publishing schema: ${id}`);

      const schema = await this.schemasService.publishSchema(id);

      res.status(200).json({
        success: true,
        data: schema,
        timestamp: new Date(),
      } as ApiResponse<IFormSchema>);
    } catch (error) {
      logger.error(`Failed to publish schema ${req.params.id}`, error);
      next(error);
    }
  }
}
