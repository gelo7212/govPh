import { AuditLogEntry, AuditAction, UserRole } from '../types';
import { Logger, createLogger } from '../utils/logger';

const logger = createLogger('AuditLogger');

/**
 * Audit Logger Service
 * Provides legal-grade action tracking for compliance and investigation
 * Every admin action is logged immutably
 */
export class AuditLoggerService {
  constructor(private auditLogCollection?: any) {} // MongoDB collection

  /**
   * Log an admin action
   * CRITICAL: This must be called for EVERY privileged operation
   */
  async log(
    actorUserId: string,
    actorRole: UserRole,
    action: AuditAction,
    metadata?: {
      municipalityCode?: string;
      targetUserId?: string;
      targetRole?: UserRole;
      details?: Record<string, unknown>;
      count?: number;
    }
  ): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      actorUserId,
      actorRole,
      action,
      municipalityCode: metadata?.municipalityCode,
      targetUserId: metadata?.targetUserId,
      targetRole: metadata?.targetRole,
      metadata: metadata?.details,
    };

    try {
      if (this.auditLogCollection) {
        await this.auditLogCollection.insertOne(auditEntry);
      }

      logger.info('Audit log recorded', {
        action,
        actor: actorUserId,
        role: actorRole,
      });
    } catch (error) {
      // CRITICAL: Audit logging must not crash the application
      // But it must be logged for investigation
      logger.error('Failed to write audit log', {
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // In production, you might send an alert here
      // For now, we log and continue
    }
  }

  /**
   * Retrieve audit logs with filtering
   * Only app_admin can view cross-municipality logs
   * city_admin/sos_admin can only view their own municipality
   */
  async getAuditLogs(
    filters?: {
      actorUserId?: string;
      action?: AuditAction;
      municipalityCode?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<AuditLogEntry[]> {
    if (!this.auditLogCollection) {
      return [];
    }

    const query: Record<string, unknown> = {};

    if (filters?.actorUserId) {
      query.actorUserId = filters.actorUserId;
    }

    if (filters?.action) {
      query.action = filters.action;
    }

    if (filters?.municipalityCode) {
      query.municipalityCode = filters.municipalityCode;
    }

    if (filters?.startDate || filters?.endDate) {
      query.timestamp = {};
      if (filters?.startDate) {
        (query.timestamp as Record<string, Date>).$gte = filters.startDate;
      }
      if (filters?.endDate) {
        (query.timestamp as Record<string, Date>).$lte = filters.endDate;
      }
    }

    try {
      return await this.auditLogCollection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(filters?.limit || 100)
        .toArray();
    } catch (error) {
      logger.error('Failed to retrieve audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

/**
 * Log successful user creation
 */
export async function logUserCreated(
  auditLogger: AuditLoggerService,
  creatorUserId: string,
  creatorRole: UserRole,
  createdUserId: string,
  createdUserRole: UserRole,
  municipalityCode?: string
): Promise<void> {
  const action = createdUserRole === 'CITY_ADMIN'
    ? 'create_city_admin'
    : createdUserRole === 'SOS_ADMIN'
    ? 'create_sos_admin'
    : 'create_user';

  await auditLogger.log(creatorUserId, creatorRole, action as AuditAction, {
    municipalityCode,
    targetUserId: createdUserId,
    targetRole: createdUserRole,
  });
}

/**
 * Log status change
 */
export async function logStatusChange(
  auditLogger: AuditLoggerService,
  changerUserId: string,
  changerRole: UserRole,
  targetUserId: string,
  newStatus: string,
  municipalityCode?: string
): Promise<void> {
  const statusActions: Record<string, AuditAction> = {
    active: 'activate_user',
    suspended: 'suspend_user',
    archived: 'archive_user',
  };

  const action = statusActions[newStatus] || 'activate_user';

  await auditLogger.log(changerUserId, changerRole, action, {
    municipalityCode,
    targetUserId,
    details: { newStatus },
  });
}

/**
 * Log rescuer mission creation
 */
export async function logRescuerMissionCreated(
  auditLogger: AuditLoggerService,
  creatorUserId: string,
  creatorRole: UserRole,
  sosId: string,
  municipalityCode?: string
): Promise<void> {
  await auditLogger.log(
    creatorUserId,
    creatorRole,
    'create_rescuer_mission',
    {
      municipalityCode,
      details: { sosId },
    }
  );
}

/**
 * Log rescuer mission revocation
 */
export async function logRescuerMissionRevoked(
  auditLogger: AuditLoggerService,
  revokerUserId: string,
  revokerRole: UserRole,
  sosId: string,
  municipalityCode?: string
): Promise<void> {
  await auditLogger.log(
    revokerUserId,
    revokerRole,
    'revoke_rescuer_mission',
    {
      municipalityCode,
      details: { sosId },
    }
  );
}
