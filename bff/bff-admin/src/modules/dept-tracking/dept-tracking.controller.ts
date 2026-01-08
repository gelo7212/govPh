import { Request, Response } from 'express';
import { deptTrackingAggregator } from './dept-tracking.aggregator';
import { CreateShareableLinkDto } from './dept-tracking.types';


/**
 * Department Tracking Controller
 * Handles HTTP requests for department tracking operations
 */
export class DeptTrackingController {
  /**
   * POST /dept-tracking/create
   * Create a shareable link for incident/assignment
   */
  async createShareableLink(req: Request, res: Response): Promise<void> {
    try {
      const { cityId, departmentId, scope, assignmentId, incidentId } = req.body;
      const userId = req.context?.user?.id || req.context?.user?.userId;

      if(!userId){
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized: User information is missing',
          },
        });
        return;
      }


      // Validate required fields
      if (!cityId || !departmentId || !scope || !incidentId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'cityId, departmentId, scope, and incidentId are required',
          },
        });
        return;
      }

      // Validate scope
      if (!['ASSIGNMENT_ONLY', 'DEPT_ACTIVE'].includes(scope)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'scope must be ASSIGNMENT_ONLY or DEPT_ACTIVE',
          },
        });
        return;
      }

      // Validate assignmentId for ASSIGNMENT_ONLY scope
      if (scope === 'ASSIGNMENT_ONLY' && !assignmentId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'assignmentId is required for ASSIGNMENT_ONLY scope',
          },
        });
        return;
      }

      const data: CreateShareableLinkDto = {
        cityId,
        departmentId,
        scope,
        incidentId,
        ...(assignmentId && { assignmentId }),
      };

      const result = await deptTrackingAggregator.createShareableLink(data, userId);

      res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });

      console.log(`Created shareable link for incident ${incidentId}`, {
        scope,
        departmentId,
        userId,
      });
    } catch (error) {
      console.log('Error in createShareableLink', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * GET /dept-tracking/validate/:hashToken
   * Validate a shareable link
   */
  async validateShareableLink(req: Request, res: Response): Promise<void> {
    try {
      const { hashToken } = req.params;

      if (!hashToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'hashToken is required',
          },
        });
        return;
      }

      const result = await deptTrackingAggregator.validateShareableLink(hashToken);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });

      console.log(`Validated shareable link`, { hashToken: hashToken.substring(0, 10) });
    } catch (error) {
      console.log('Error in validateShareableLink', error);

      if (error instanceof Error && error.message.includes('invalid or expired')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'INVALID_OR_EXPIRED_TOKEN',
            message: 'Shareable link is invalid or expired',
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }
  }

  /**
   * DELETE /dept-tracking/revoke/:hashToken
   * Revoke a shareable link
   */
  async revokeShareableLink(req: Request, res: Response): Promise<void> {
    try {
      const { hashToken } = req.params;

      if (!hashToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'hashToken is required',
          },
        });
        return;
      }

      await deptTrackingAggregator.revokeShareableLink(hashToken);

      res.status(200).json({
        success: true,
        data: { message: 'Shareable link revoked successfully' },
        timestamp: new Date(),
      });

      console.log(`Revoked shareable link`, { hashToken: hashToken.substring(0, 10) });
    } catch (error) {
      console.log('Error in revokeShareableLink', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * GET /dept-tracking/department/:departmentId
   * Get active shareable links for a department
   */
  async getActiveLinksByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId } = req.params;

      if (!departmentId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'departmentId is required',
          },
        });
        return;
      }

      const result = await deptTrackingAggregator.getActiveLinksByDepartment(departmentId);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });

      console.log(`Retrieved active links for department ${departmentId}`, {
        count: result.length,
      });
    } catch (error) {
      console.log('Error in getActiveLinksByDepartment', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}

export const deptTrackingController = new DeptTrackingController();