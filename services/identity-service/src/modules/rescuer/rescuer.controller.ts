import { Request, Response } from 'express';
import { rescuerMissionService } from './rescuer.service';
import { AuditLoggerService } from '../../services/auditLogger';
import {
  logRescuerMissionCreated,
  logRescuerMissionRevoked,
} from '../../services/auditLogger';
import { getCollection } from '../../config/database';
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  RescuerMissionNotFoundError,
} from '../../errors';
import { createLogger } from '../../utils/logger';

const logger = createLogger('RescuerController');

/**
 * Rescuer Controller - Handles rescuer mission creation and verification
 * Rescuers are NOT users - they are mission-based with limited scope
 */
export class RescuerController {
  private auditLogger: AuditLoggerService | null = null;

  private getAuditLogger(): AuditLoggerService {
    if (!this.auditLogger) {
      this.auditLogger = new AuditLoggerService(getCollection('audit_logs'));
    }
    return this.auditLogger;
  }

  /**
   * POST /rescuer/mission
   * Create a new rescuer mission for a SOS
   * Only city_admin and sos_admin can create missions
   *
   * SOS MS will call this endpoint to create a mission when assigning rescuers
   */
  async createMission(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const { sosId, expiresInMinutes } = req.body;

      if (!sosId) {
        throw new ValidationError('Missing required field: sosId');
      }

      // Only city_admin and sos_admin can create missions
      if (!['city_admin', 'sos_admin'].includes(req.user.role)) {
        throw new UnauthorizedError(
          `Only city_admin and sos_admin can create missions`
        );
      }

      if (!req.user.municipalityCode) {
        throw new Error('INVALID_MUNICIPALITY_SCOPE');
      }

      const mission = await rescuerMissionService.createMission(
        sosId,
        req.user.municipalityCode,
        req.user.userId,
        req.user.role,
        expiresInMinutes || 60
      );

      // Log the action
      await logRescuerMissionCreated(
        this.getAuditLogger(),
        req.user.userId,
        req.user.role,
        sosId,
        req.user.municipalityCode
      );

      res.status(201).json({
        success: true,
        data: {
          id: mission.id,
          sosId: mission.sosId,
          token: mission.token,
          expiresAt: mission.expiresAt,
          permissions: mission.permissions,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to create rescuer mission', error);
      throw error;
    }
  }

  /**
   * GET /rescuer/mission/verify
   * Verify a rescuer mission token
   * Returns mission details if valid (used by rescuer app to verify access)
   */
  async verifyMission(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        throw new ValidationError('Missing required field: token');
      }

      const mission = await rescuerMissionService.verifyMissionToken(token);

      res.status(200).json({
        success: true,
        data: {
          sosId: mission.sosId,
          municipalityCode: mission.municipalityCode,
          expiresAt: mission.expiresAt,
          permissions: mission.permissions,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to verify rescuer mission', error);
      throw error;
    }
  }

  /**
   * POST /rescuer/mission/revoke
   * Revoke a rescuer mission
   * Only city_admin and sos_admin can revoke missions
   */
  async revokeMission(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const { missionId, sosId } = req.body;

      if (!missionId && !sosId) {
        throw new ValidationError(
          'Missing required field: missionId or sosId'
        );
      }

      if (sosId) {
        // Revoke all missions for a SOS
        await rescuerMissionService.revokeSosMissions(sosId);

        // Log the action
        await logRescuerMissionRevoked(
          this.getAuditLogger(),
          req.user.userId,
          req.user.role,
          sosId,
          req.user.municipalityCode
        );

        res.status(200).json({
          success: true,
          data: { message: 'All missions for SOS revoked' },
          timestamp: new Date(),
        });
      } else {
        // Revoke single mission
        await rescuerMissionService.revokeMission(missionId);

        res.status(200).json({
          success: true,
          data: { message: 'Mission revoked' },
          timestamp: new Date(),
        });
      }
    } catch (error) {
      logger.error('Failed to revoke rescuer mission', error);
      throw error;
    }
  }
}

export const rescuerController = new RescuerController();
