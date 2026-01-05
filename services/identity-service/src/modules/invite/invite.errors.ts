/**
 * Invite-specific error classes
 */

import {
  IdentityServiceError,
  ValidationError,
} from '../../errors';

export class InviteNotFoundError extends IdentityServiceError {
  constructor(inviteId: string) {
    super(
      'INVITE_NOT_FOUND',
      `Invite with ID '${inviteId}' not found`,
      404
    );
  }
}

export class InviteExpiredError extends IdentityServiceError {
  constructor(inviteId: string) {
    super(
      'INVITE_EXPIRED',
      `Invite '${inviteId}' has expired`,
      410
    );
  }
}

export class InviteAlreadyUsedError extends IdentityServiceError {
  constructor(inviteId: string) {
    super(
      'INVITE_ALREADY_USED',
      `Invite '${inviteId}' has already been used`,
      410
    );
  }
}

export class InvalidInviteCodeError extends IdentityServiceError {
  constructor() {
    super(
      'INVALID_INVITE_CODE',
      'Invalid or incorrect invite code',
      400
    );
  }
}

export class CannotCreateInviteError extends IdentityServiceError {
  constructor(userRole: string, targetRole: string) {
    super(
      'CANNOT_CREATE_INVITE',
      `User role '${userRole}' cannot create invites for role '${targetRole}'`,
      403
    );
  }
}

export class InviteRoleMismatchError extends IdentityServiceError {
  constructor(expectedRole: string, userRole: string) {
    super(
      'INVITE_ROLE_MISMATCH',
      `Invite expects role '${expectedRole}' but user has role '${userRole}'`,
      403
    );
  }
}
