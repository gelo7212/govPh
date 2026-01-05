/**
 * Invite Types - Local to BFF Admin
 * These mirror the identity-service invite types
 */

/**
 * Invite Status Types
 */
export type InviteStatus = 'PENDING' | 'USED' | 'EXPIRED';

/**
 * Invite Role - Roles that can be invited
 */
export type InviteRole = 'CITY_ADMIN' | 'SOS_ADMIN' | 'SK_ADMIN';

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

/**
 * List Invites Response DTO
 */
export interface ListInvitesResponse {
  invites: InviteListItem[];
  total: number;
  page: number;
  limit: number;
}
