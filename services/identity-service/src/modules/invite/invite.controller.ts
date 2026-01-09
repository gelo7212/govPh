import { Request, Response } from 'express';
import { RequestUser, ApiResponse } from '../../types';
import { inviteService } from './invite.service';
import { AuditLoggerService } from '../../services/auditLogger';
import { getCollection } from '../../config/database';
import {
  ValidationError,
  UnauthorizedError,
} from '../../errors';
import { createLogger } from '../../utils/logger';
import {
  CreateInviteRequest,
  InviteListItem,
  ListInvitesQuery,
} from './invite.types';

const logger = createLogger('InviteController');

/**
 * Invite Controller - Handles invite endpoints
 */
export class InviteController {
  private auditLogger: AuditLoggerService | null = null;

  private getAuditLogger(): AuditLoggerService {
    if (!this.auditLogger) {
      this.auditLogger = new AuditLoggerService(getCollection('audit_logs'));
    }
    return this.auditLogger;
  }

  /**
   * POST /invites
   * Create a new invite
   * Allowed: APP_ADMIN, CITY_ADMIN
   *
   * Body:
   * {
   *   role: 'CITY_ADMIN' | 'SOS_ADMIN' | 'SK_ADMIN',
   *   municipalityCode: string
   * }
   */
  async createInvite(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const { role, municipalityCode } = req.body as CreateInviteRequest;

      // Validation
      if (!role || !municipalityCode) {
        throw new ValidationError(
          'Missing required fields: role, municipalityCode'
        );
      }

      if (!['CITY_ADMIN', 'SOS_ADMIN', 'SK_ADMIN', 'RESCUER'].includes(role)) {
        throw new ValidationError(
          'Invalid invite role. Must be: CITY_ADMIN, SOS_ADMIN, SK_ADMIN, or RESCUER',
          'role'
        );
      }

      // Create invite through service
      const inviteResponse = await inviteService.createInvite(
        req.user.userId,
        req.user.role,
        req.user.municipalityCode,
        role,
        municipalityCode
      );

      // Audit log
      await this.getAuditLogger().log(
        req.user.userId,
        req.user.role,
        'create_city_admin',
        {
          municipalityCode,
          details: {
            inviteId: inviteResponse.inviteId,
            inviteRole: role,
          },
        }
      );

      const response: ApiResponse = {
        success: true,
        data: inviteResponse,
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /invites/:inviteId
   * Validate invite (check if valid, not expired, not used)
   * No auth required (user may not be logged in yet)
   */
  async validateInvite(req: Request, res: Response): Promise<void> {
    try {
      const { inviteId } = req.params;

      if (!inviteId) {
        throw new ValidationError('Missing inviteId parameter');
      }

      const validationResult = await inviteService.validateInvite(inviteId);

      const response: ApiResponse = {
        success: validationResult.valid,
        data: validationResult,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /invites/:inviteId/accept
   * Accept invite with 6-digit code
   * Requires authentication
   *
   * Body:
   * {
   *   code: string (6 digits)
   * }
   */
  async acceptInvite(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const { inviteId } = req.params;
      const { code } = req.body;

      if (!inviteId || !code) {
        throw new ValidationError('Missing required fields: inviteId, code');
      }

      // Accept invite
      const usedInvite = await inviteService.acceptInvite(
        inviteId,
        code,
        req.user.userId,
        req.user.role
      );

      // Audit log
      await this.getAuditLogger().log(
        req.user.userId,
        req.user.role,
        'create_city_admin',
        {
          municipalityCode: usedInvite.municipalityCode,
          details: {
            inviteId,
          },
        }
      );

      const response: ApiResponse = {
        success: true,
        data: {
          success: true,
          role: usedInvite.role,
          municipalityCode: usedInvite.municipalityCode,
          message: `You are now a ${usedInvite.role} for ${usedInvite.municipalityCode}`,
        },
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /invites
   * List invites (admin dashboard)
   * Allowed: APP_ADMIN, CITY_ADMIN
   *
   * Query params:
   * - role: CITY_ADMIN | SOS_ADMIN | SK_ADMIN
   * - municipalityCode: string
   * - page: number
   * - limit: number
   */
  async listInvites(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const {
        role,
        municipalityCode,
        page = 1,
        limit = 20,
      } = req.query as unknown as ListInvitesQuery & Record<string, number>;

      const pageNum = Math.max(1, typeof page === 'string' ? parseInt(page) : page);
      const limitNum = Math.min(100, Math.max(1, typeof limit === 'string' ? parseInt(limit) : limit));

      // Get invites
      const { invites, total } = await inviteService.listInvites(
        req.user.role === 'APP_ADMIN' ? undefined : req.user.userId,
        role,
        municipalityCode || req.user.municipalityCode,
        pageNum,
        limitNum
      );

      // Map to response format
      const inviteItems: InviteListItem[] = invites.map((inv) => ({
        id: inv.id!,
        code: inv.code,
        role: inv.role,
        municipalityCode: inv.municipalityCode,
        status: inv.usedAt ? 'USED' : new Date() > inv.expiresAt ? 'EXPIRED' : 'PENDING',
        createdBy: inv.createdByUserId,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
        usedByUserId: inv.usedByUserId,
        usedAt: inv.usedAt,
      }));

      const response: ApiResponse = {
        success: true,
        data: {
          invites: inviteItems,
          total,
          page: pageNum,
          limit: limitNum,
        },
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  }
}

// Singleton instance
export const inviteController = new InviteController();
