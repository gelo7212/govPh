import { createLogger } from '../../utils/logger';
import {
  InviteEntity,
  InviteStatus,
  InviteRole,
} from './invite.types';
import { 
  generateInviteCode, 
  isInviteExpired,
  calculateExpiration,
} from './invite.utils';
import {
  InviteNotFoundError,
} from './invite.errors';
import { ObjectId } from 'mongodb';
import { InviteModel } from './invite.mongo.schema';

const logger = createLogger('InviteRepository');

/**
 * Invite Repository - Database operations for invites
 */
export class InviteRepository {

  /**
   * Create a new invite
   */
  async create(
    role: InviteRole,
    municipalityCode: string,
    createdByUserId: string,
    departmentId?: string,
    department?: string
  ): Promise<InviteEntity> {
    const code = generateInviteCode();
    const expiresAt = calculateExpiration();

    const invite = await InviteModel.create({
      code,
      role,
      municipalityCode,
      createdByUserId,
      createdAt: new Date(),
      expiresAt,
      departmentId,
      department,
    });

    logger.info(`Invite created: ${invite._id} by ${createdByUserId}`);

    return this.mapToEntity(invite);
  }

  /**
   * Find invite by ID
   */
  async findById(inviteId: string): Promise<InviteEntity | null> {
    if (!ObjectId.isValid(inviteId)) {
      return null;
    }

    const invite = await InviteModel.findById(inviteId);

    if (!invite) {
      return null;
    }

    return this.mapToEntity(invite);
  }

  /**
   * Find invite by code
   */
  async findByCode(code: string): Promise<InviteEntity | null> {
    const invite = await InviteModel.findOne({ code });

    if (!invite) {
      return null;
    }

    return this.mapToEntity(invite);
  }

  /**
   * Mark invite as used
   */
  async markAsUsed(
    inviteId: string,
    usedByUserId: string
  ): Promise<InviteEntity> {
    if (!ObjectId.isValid(inviteId)) {
      throw new InviteNotFoundError(inviteId);
    }

    const invite = await InviteModel.findByIdAndUpdate(
      inviteId,
      {
        usedAt: new Date(),
        usedByUserId,
      },
      { new: true }
    );

    if (!invite) {
      throw new InviteNotFoundError(inviteId);
    }

    logger.info(`Invite ${inviteId} marked as used by ${usedByUserId}`);

    return this.mapToEntity(invite);
  }

  /**
   * Get invite status
   */
  async getStatus(inviteId: string): Promise<InviteStatus> {
    const invite = await this.findById(inviteId);

    if (!invite) {
      throw new InviteNotFoundError(inviteId);
    }

    if (invite.usedAt) {
      return 'USED';
    }

    if (isInviteExpired(invite.expiresAt)) {
      return 'EXPIRED';
    }

    return 'PENDING';
  }

  /**
   * List invites with filtering
   */
  async list(
    createdByUserId?: string,
    role?: InviteRole,
    municipalityCode?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ invites: InviteEntity[]; total: number }> {
    const filter: any = {};
    if (createdByUserId) {
      filter.createdByUserId = createdByUserId;
    }
    if (role) {
      filter.role = role;
    }
    if (municipalityCode) {
      filter.municipalityCode = municipalityCode;
    }

    const total = await InviteModel.countDocuments(filter);
    const skip = (page - 1) * limit;

    const invites = await InviteModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      invites: invites.map((inv) => this.mapToEntity(inv)),
      total,
    };
  }

  /**
   * Delete expired invites (cleanup job)
   */
  async deleteExpired(): Promise<number> {
    const now = new Date();

    const result = await InviteModel.deleteMany({
      expiresAt: { $lt: now },
      usedAt: { $exists: false }, // Only delete if not used
    });

    logger.info(`Deleted ${result.deletedCount} expired invites`);
    return result.deletedCount;
  }

  /**
   * Map MongoDB document to InviteEntity
   */
  private mapToEntity(doc: any): InviteEntity {
    return {
      id: doc._id.toString(),
      code: doc.code,
      role: doc.role,
      municipalityCode: doc.municipalityCode,
      createdByUserId: doc.createdByUserId,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
      usedAt: doc.usedAt,
      usedByUserId: doc.usedByUserId,
      departmentId: doc.departmentId,
      department: doc.department,
    };
  }
}

// Singleton instance
export const inviteRepository = new InviteRepository();
