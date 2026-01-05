import { UserRole, Department } from '../../types';

/**
 * Invite Status Types
 */
export type InviteStatus = 'PENDING' | 'USED' | 'EXPIRED';

/**
 * Invite Role - Roles that can be invited
 */
export type InviteRole = 'CITY_ADMIN' | 'SOS_ADMIN' | 'SK_ADMIN';

/**
 * Invite Entity - Database model
 */
export interface InviteEntity {
  id?: string;
  code: string; // 6-digit code
  role: InviteRole;
  municipalityCode: string;
  createdByUserId: string;
  usedByUserId?: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
}

/**
 * Create Invite Request DTO
 */
export interface CreateInviteRequest {
  role: InviteRole;
  municipalityCode: string;
}

/**
 * Create Invite Response DTO
 */
export interface CreateInviteResponse {
  inviteId: string;
  code: string;
  role: InviteRole;
  municipalityCode: string;
  expiresAt: Date;
  inviteLink: string;
}

/**
 * Validate Invite Response DTO
 */
export interface ValidateInviteResponse {
  inviteId: string;
  valid: boolean;
  role?: InviteRole;
  municipalityCode?: string;
  expiresAt?: Date;
  reason?: string; // 'EXPIRED' | 'USED' | 'INVALID'
}

/**
 * Accept Invite Request DTO
 */
export interface AcceptInviteRequest {
  code: string;
}

/**
 * Accept Invite Response DTO
 */
export interface AcceptInviteResponse {
  success: boolean;
  role: InviteRole;
  municipalityCode: string;
  message: string;
}

/**
 * List Invites Query Params
 */
export interface ListInvitesQuery {
  status?: InviteStatus;
  role?: InviteRole;
  municipalityCode?: string;
  page?: number;
  limit?: number;
}

/**
 * List Invites Response DTO
 */
export interface ListInvitesResponse {
  invites: InviteListItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Invite List Item
 */
export interface InviteListItem {
  id: string;
  code: string;
  role: InviteRole;
  municipalityCode: string;
  status: InviteStatus;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  usedByUserId?: string;
  usedAt?: Date;
}
