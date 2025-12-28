import { Request, Response } from 'express';
import { IncidentEntity } from '../../types';
import { incidentService } from './incident.service';
import { getErrorResponse } from '../../errors';
import { createLogger } from '../../utils/logger';

const logger = createLogger('IncidentController');

/**
 * Incident Controller - HTTP request handler
 */
export class IncidentController {
  /**
   * POST /incidents
   * Create a new incident
   */
  async createIncident(req: Request, res: Response): Promise<void> {
    try {
      const incidentData: IncidentEntity = {
        type: req.body.type,
        title: req.body.title,
        description: req.body.description,
        severity: req.body.severity,
        status: 'open',
        location: req.body.location,
        reporter: req.body.reporter,
        attachments: req.body.attachments,
        metadata: req.body.metadata,
      };

      const incident = await incidentService.createIncident(incidentData);
      
      res.status(201).json({
        success: true,
        data: incident,
        message: 'Incident created successfully',
      });
    } catch (error) {
      logger.error('Error in createIncident', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /incidents/:id
   * Get incident by ID
   */
  async getIncidentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const incident = await incidentService.getIncidentById(id);

      res.json({
        success: true,
        data: incident,
      });
    } catch (error) {
      logger.error('Error in getIncidentById', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /incidents/city/:cityCode
   * Get incidents by city code
   */
  async getIncidentsByCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const incidents = await incidentService.getIncidentsByCity(
        cityCode,
        limit,
        skip
      );
      const total = await incidentService.getIncidentCountByCity(cityCode);

      res.json({
        success: true,
        data: incidents,
        pagination: {
          total,
          limit,
          skip,
        },
      });
    } catch (error) {
      logger.error('Error in getIncidentsByCity', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /incidents/user/:userId
   * Get incidents by user ID
   */
  async getIncidentsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const incidents = await incidentService.getIncidentsByUserId(
        userId,
        limit,
        skip
      );

      res.json({
        success: true,
        data: incidents,
        pagination: {
          limit,
          skip,
        },
      });
    } catch (error) {
      logger.error('Error in getIncidentsByUserId', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /incidents
   * Get all incidents
   */
  async getAllIncidents(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const incidents = await incidentService.getAllIncidents(limit, skip);

      res.json({
        success: true,
        data: incidents,
        pagination: {
          limit,
          skip,
        },
      });
    } catch (error) {
      logger.error('Error in getAllIncidents', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * PATCH /incidents/:id/status
   * Update incident status
   */
  async updateIncidentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const incident = await incidentService.updateIncidentStatus(id, status);

      res.json({
        success: true,
        data: incident,
        message: 'Incident status updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateIncidentStatus', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * PUT /incidents/:id
   * Update incident
   */
  async updateIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const incident = await incidentService.updateIncident(id, req.body);

      res.json({
        success: true,
        data: incident,
        message: 'Incident updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateIncident', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * DELETE /incidents/:id
   * Delete incident
   */
  async deleteIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await incidentService.deleteIncident(id);

      res.json({
        success: true,
        message: 'Incident deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteIncident', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}

// Export singleton instance
export const incidentController = new IncidentController();
