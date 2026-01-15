import { Request, Response } from 'express';
import { InviteAggregator } from './invite.aggregator';
import { handleServiceError, sendErrorResponse } from '@gov-ph/bff-core';

export class InviteController {
  private aggregator: InviteAggregator;

  constructor(aggregator: InviteAggregator) {
    this.aggregator = aggregator;
  }

  /**
   * POST /invites
   * Create a new invite
   * Allowed: APP_ADMIN, CITY_ADMIN
   *
   * Request body:
   * {
   *   role: 'CITY_ADMIN' | 'SOS_ADMIN' | 'SK_ADMIN',
   *   municipalityCode: string
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     inviteId: string,
   *     code: string,
   *     role: string,
   *     municipalityCode: string,
   *     expiresAt: Date,
   *     inviteLink: string
   *   },
   *   timestamp: Date
   * }
   */
  async createInvite(req: Request, res: Response): Promise<void> {
    try {
      const { role, municipalityCode, department, departmentId } = req.body;

      if (!role || !municipalityCode) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'role and municipalityCode are required');
        return;
      }
      const token = this.getToken(req);

      const result = await this.aggregator.createInvite(role, municipalityCode, token, department, departmentId);

      res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to create invite');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * GET /invites/:inviteId
   * Validate invite (check if valid, not expired, not used)
   * No auth required
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     inviteId: string,
   *     valid: boolean,
   *     role?: string,
   *     municipalityCode?: string,
   *     expiresAt?: Date,
   *     reason?: 'EXPIRED' | 'USED' | 'INVALID'
   *   },
   *   timestamp: Date
   * }
   */
  async validateInvite(req: Request, res: Response): Promise<void> {
    try {
      const { inviteId } = req.params;

      if (!inviteId) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'inviteId is required');
        return;
      }
      // const token = this.getToken(req);
      const result = await this.aggregator.validateInvite(inviteId);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to validate invite');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * POST /invites/:inviteId/accept
   * Accept invite with 6-digit code
   * Requires authentication
   *
   * Request body:
   * {
   *   code: string (6 digits)
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     success: true,
   *     role: string,
   *     municipalityCode: string,
   *     message: string
   *   },
   *   timestamp: Date
   * }
   */
  async acceptInvite(req: Request, res: Response): Promise<void> {
    try {
      const { inviteId } = req.params;
      const { code } = req.body;

      if (!inviteId || !code) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'inviteId and code are required');
        return;
      }

      const result = await this.aggregator.acceptInvite(inviteId, code, this.getToken(req));

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to accept invite');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * GET /invites
   * List invites (admin dashboard)
   * Allowed: APP_ADMIN, CITY_ADMIN
   *
   * Query params:
   * - role?: 'CITY_ADMIN' | 'SOS_ADMIN' | 'SK_ADMIN'
   * - municipalityCode?: string
   * - page?: number (default: 1)
   * - limit?: number (default: 20)
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     invites: InviteListItem[],
   *     total: number,
   *     page: number,
   *     limit: number
   *   },
   *   timestamp: Date
   * }
   */
  async listInvites(req: Request, res: Response): Promise<void> {
    try {
        const { role, municipalityCode, page = 1, limit = 20 } = req.query;
       
        const token = this.getToken(req);

        const pageNum = Math.max(1, typeof page === 'string' ? parseInt(page) : (page as number));
        const limitNum = Math.min(100, Math.max(1, typeof limit === 'string' ? parseInt(limit) : (limit as number)));

        const result = await this.aggregator.listInvites(
            typeof role === 'string' ? role : undefined,
            typeof municipalityCode === 'string' ? municipalityCode : undefined,
            pageNum,
            limitNum,
            token
        );

        res.status(200).json({
            success: true,
            data: result,
            timestamp: new Date(),
        });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to list invites');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  /**
   * Extract JWT token from Authorization header
   */
  private getToken(req: Request): string {
    const authHeader = req.headers.authorization as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header with Bearer token is required');
    }
    // get token from authorization header :: Bearer <token>
    const token = authHeader.replace('Bearer ', '');
    return token;
  }
}
