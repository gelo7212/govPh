import { AUTHORITY_RULES, UserRole } from '../../types';
import { createLogger } from '../../utils/logger';
import {
  inviteRepository,
  InviteRepository,
} from './invite.repository';
import {
  InviteEntity,
  InviteRole,
  CreateInviteResponse,
  ValidateInviteResponse,
} from './invite.types';
import {
  CannotCreateInviteError,
  InviteNotFoundError,
  InviteExpiredError,
  InviteAlreadyUsedError,
  InvalidInviteCodeError,
} from './invite.errors';
import { MunicipalityAccessDeniedError } from '../../errors';
import {
  generateInviteLink,
  isInviteExpired,
  isValidInviteCode,
} from './invite.utils';
import { UserService } from '../user/user.service';

const logger = createLogger('InviteService');

/**
 * Invite Service - Business logic for invite flow
 */
export class InviteService {
  constructor(private repository: InviteRepository, private userService: UserService) {}

  /**
   * Create invite
   * Validates:
   * - Creator has permission to create this role
   * - Creator is scoped to the municipality
   */
  async createInvite(
    creatorUserId: string,
    creatorRole: UserRole,
    creatorMunicipalityCode: string | undefined,
    targetRole: InviteRole,
    targetMunicipalityCode: string
  ): Promise<CreateInviteResponse> {
    // Validate creator has permission to invite this role
    const allowedRoles = AUTHORITY_RULES[creatorRole];
    if (!allowedRoles.includes(targetRole as UserRole)) {
      logger.warn(
        `User ${creatorUserId} (${creatorRole}) cannot create invites for ${targetRole}`
      );
      throw new CannotCreateInviteError(creatorRole, targetRole);
    }

    // Validate municipality scope for non-app-admins
    if (
      creatorRole !== 'APP_ADMIN' &&
      creatorMunicipalityCode !== targetMunicipalityCode
    ) {
      throw new MunicipalityAccessDeniedError(
        creatorMunicipalityCode || 'UNKNOWN',
        targetMunicipalityCode
      );
    }

    // Create invite in database
    const invite = await this.repository.create(
      targetRole,
      targetMunicipalityCode,
      creatorUserId
    );
    const INVITE_LINK_HOST = process.env.INVITE_LINK_HOST || 'https://pilot.e-citizen.click/invites'; 

    logger.info(
      `Invite created: ${invite.id} for ${targetRole} in ${targetMunicipalityCode}`
    );

    return {
      inviteId: invite.id!,
      code: invite.code,
      role: invite.role,
      municipalityCode: invite.municipalityCode,
      expiresAt: invite.expiresAt,
      inviteLink: generateInviteLink(invite.id!, INVITE_LINK_HOST),
    };
  }

  /**
   * Validate invite (when user opens invite link)
   * Checks: exists, not expired, not used
   */
  async validateInvite(inviteId: string): Promise<ValidateInviteResponse> {
    const invite = await this.repository.findById(inviteId);

    if (!invite) {
      return {
        inviteId,
        valid: false,
        reason: 'INVALID',
      };
    }

    if (isInviteExpired(invite.expiresAt)) {
      return {
        inviteId,
        valid: false,
        reason: 'EXPIRED',
        expiresAt: invite.expiresAt,
      };
    }

    if (invite.usedAt) {
      return {
        inviteId,
        valid: false,
        reason: 'USED',
      };
    }

    return {
      inviteId,
      valid: true,
      role: invite.role,
      municipalityCode: invite.municipalityCode,
      expiresAt: invite.expiresAt,
    };
  }

  /**
   * Accept invite
   * Validates:
   * - Code is correct
   * - Invite not expired
   * - Invite not already used
   * - User role matches invite role
   */
  async acceptInvite(
    inviteId: string,
    code: string,
    userId: string,
    userRole: UserRole
  ): Promise<InviteEntity> {
    // Validate code format
    if (!isValidInviteCode(code)) {
      throw new InvalidInviteCodeError();
    }

    // Get invite
    const invite = await this.repository.findById(inviteId);
    if (!invite) {
      throw new InviteNotFoundError(inviteId);
    }

    // Check if expired
    if (isInviteExpired(invite.expiresAt)) {
      throw new InviteExpiredError(inviteId);
    }

    // Check if already used
    if (invite.usedAt) {
      throw new InviteAlreadyUsedError(inviteId);
    }

    // Verify code matches
    if (invite.code !== code) {
      throw new InvalidInviteCodeError();
    }

    const findUser = await this.userService.getUserById(userId);
    if (!findUser) {
      throw new Error(`User not found: ${userId}`);
    }
   
    if (findUser.role === 'APP_ADMIN') {
      throw new Error(`User cannot accept invite: ${userId} is an APP_ADMIN`);
    }
 
    // Mark as used
    const usedInvite = await this.repository.markAsUsed(inviteId, userId);
    
    // Allow role reassignment.

    await this.userService.assignRole(userId, invite.role);

    logger.info(
      `Invite ${inviteId} accepted by user ${userId} for role ${invite.role}`
    );

    return usedInvite;
  }

  /**
   * List invites (for admin dashboard)
   */
  async listInvites(
    creatorUserId?: string,
    targetRole?: InviteRole,
    municipalityCode?: string,
    page: number = 1,
    limit: number = 20
  ) {
    return this.repository.list(
      creatorUserId,
      targetRole,
      municipalityCode,
      page,
      limit
    );
  }

  /**
   * Get invite by code (alternative lookup)
   */
  async getInviteByCode(code: string): Promise<InviteEntity | null> {
    return this.repository.findByCode(code);
  }
}

// Singleton instance
const userService = new UserService();
export const inviteService = new InviteService(inviteRepository, userService);
