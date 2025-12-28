import { Request, Response } from 'express';
import { IncidentAssignmentEntity } from '../../types';
import { assignmentService } from './assignment.service';
import { getErrorResponse } from '../../errors';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AssignmentController');

/**
 * Assignment Controller - HTTP request handler
 */
export class AssignmentController {
  /**
   * POST /assignments
   * Create a new assignment
   */
  async createAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignmentData: IncidentAssignmentEntity = {
        incidentId: req.body.incidentId,
        cityCode: req.body.cityCode,
        departmentCode: req.body.departmentCode,
        assignedBy: req.body.assignedBy,
        status: 'pending',
        responderId: req.body.responderId,
        notes: req.body.notes,
      };

      const assignment = await assignmentService.createAssignment(
        assignmentData
      );

      res.status(201).json({
        success: true,
        data: assignment,
        message: 'Assignment created successfully',
      });
    } catch (error) {
      logger.error('Error in createAssignment', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /assignments/:id
   * Get assignment by ID
   */
  async getAssignmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assignment = await assignmentService.getAssignmentById(id);

      res.json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      logger.error('Error in getAssignmentById', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /assignments/incident/:incidentId
   * Get assignments by incident ID
   */
  async getAssignmentsByIncidentId(req: Request, res: Response): Promise<void> {
    try {
      const { incidentId } = req.params;
      const assignments = await assignmentService.getAssignmentsByIncidentId(
        incidentId
      );

      res.json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      logger.error('Error in getAssignmentsByIncidentId', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /assignments/department/:cityCode/:departmentCode
   * Get assignments by city and department
   */
  async getAssignmentsByCityAndDepartment(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { cityCode, departmentCode } = req.params;
      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const assignments =
        await assignmentService.getAssignmentsByCityAndDepartment(
          cityCode,
          departmentCode,
          status as any,
          limit,
          skip
        );

      res.json({
        success: true,
        data: assignments,
        pagination: {
          limit,
          skip,
        },
      });
    } catch (error) {
      logger.error('Error in getAssignmentsByCityAndDepartment', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /assignments/responder/:responderId
   * Get assignments by responder ID
   */
  async getAssignmentsByResponderId(req: Request, res: Response): Promise<void> {
    try {
      const { responderId } = req.params;
      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const assignments = await assignmentService.getAssignmentsByResponderId(
        responderId,
        status as any,
        limit,
        skip
      );

      res.json({
        success: true,
        data: assignments,
        pagination: {
          limit,
          skip,
        },
      });
    } catch (error) {
      logger.error('Error in getAssignmentsByResponderId', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * PATCH /assignments/:id/status
   * Update assignment status
   */
  async updateAssignmentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const assignment = await assignmentService.updateAssignmentStatus(
        id,
        status
      );

      res.json({
        success: true,
        data: assignment,
        message: 'Assignment status updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateAssignmentStatus', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * POST /assignments/:id/accept
   * Accept assignment
   */
  async acceptAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assignment = await assignmentService.acceptAssignment(id);

      res.json({
        success: true,
        data: assignment,
        message: 'Assignment accepted successfully',
      });
    } catch (error) {
      logger.error('Error in acceptAssignment', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * POST /assignments/:id/reject
   * Reject assignment
   */
  async rejectAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const assignment = await assignmentService.rejectAssignment(id, notes);

      res.json({
        success: true,
        data: assignment,
        message: 'Assignment rejected successfully',
      });
    } catch (error) {
      logger.error('Error in rejectAssignment', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * POST /assignments/:id/complete
   * Complete assignment
   */
  async completeAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assignment = await assignmentService.completeAssignment(id);

      res.json({
        success: true,
        data: assignment,
        message: 'Assignment completed successfully',
      });
    } catch (error) {
      logger.error('Error in completeAssignment', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * PUT /assignments/:id
   * Update assignment
   */
  async updateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assignment = await assignmentService.updateAssignment(id, req.body);

      res.json({
        success: true,
        data: assignment,
        message: 'Assignment updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateAssignment', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * DELETE /assignments/:id
   * Delete assignment
   */
  async deleteAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await assignmentService.deleteAssignment(id);

      res.json({
        success: true,
        message: 'Assignment deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteAssignment', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}

// Export singleton instance
export const assignmentController = new AssignmentController();
