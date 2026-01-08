import { Request, Response, NextFunction } from 'express';
import { deptTrackingService } from './dept-tracking.service';
import { ApiResponse } from '../../types';
import { createLogger } from '../../utils/logger';
import { getErrorResponse } from '../../errors';

const logger = createLogger('DeptTrackingController');

/**
 * DeptTracking Controller - HTTP request handler
 */
export class DeptTrackingController {
  /**
   * POST /dept-tracking/create
   * Create a shareable link for department/assignment tracking
   */
  async createShareableLink(req: Request, res: Response): Promise<void> {
    try {
      const {
        cityId,
        departmentId,
        scope,
        assignmentId,
        incidentId,
        createdBy,
      } = req.body;

      const result = await deptTrackingService.createShareableLink({
        cityId,
        departmentId,
        scope,
        assignmentId,
        incidentId,
        createdBy,

      });

      res.status(201).json({
        success: true,
        data: {
          jwt: result.data.token,
          expiresAt: result.data.expiresAt,
        },
        timestamp: new Date(),
      } as ApiResponse);

      logger.info(`Created shareable link for department ${departmentId}`);
    } catch (error) {
      logger.error('Error in createShareableLink', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /dept-tracking/validate/:hashToken
   * Validate a shareable link
   */
  async validateShareableLink(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      const tokenRecord = await deptTrackingService.validateShareableLink(token);

      if (!tokenRecord) {
        res.status(404).json({
          success: false,
          error: {
            code: 'INVALID_OR_EXPIRED_TOKEN',
            message: 'Shareable link is invalid or expired',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          cityId: tokenRecord.cityId,
          departmentId: tokenRecord.departmentId,
          scope: tokenRecord.scope,
          assignmentId: tokenRecord.assignmentId,
          expiresAt: tokenRecord.expiresAt,
        },
        timestamp: new Date(),
      } as ApiResponse);
    } catch (error) {
      logger.error('Error in validateShareableLink', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * DELETE /dept-tracking/revoke/:hashToken
   * Revoke a shareable link
   */
  async revokeShareableLink(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      await deptTrackingService.revokeShareableLink(token);

      res.status(200).json({
        success: true,
        data: { message: 'Shareable link revoked successfully' },
        timestamp: new Date(),
      } as ApiResponse);

      logger.info(`Revoked shareable link ${token}`);
    } catch (error) {
      logger.error('Error in revokeShareableLink', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /dept-tracking/department/:departmentId
   * Get active shareable links for a department
   */
  async getActiveLinksByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId } = req.params;

      const links = await deptTrackingService.getActiveLinksByDepartment(departmentId);

      res.status(200).json({
        success: true,
        data: links.map(link => ({
          jwt: link.jwt,
          scope: link.scope,
          assignmentId: link.assignmentId,
          expiresAt: link.expiresAt,
        })),
        timestamp: new Date(),
      } as ApiResponse);
    } catch (error) {
      logger.error('Error in getActiveLinksByDepartment', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}

// Export singleton instance
export const deptTrackingController = new DeptTrackingController();