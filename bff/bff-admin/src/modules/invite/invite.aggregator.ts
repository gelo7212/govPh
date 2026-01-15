import { IdentityServiceClient } from '@gov-ph/bff-core';
import {
  CreateInviteResponse,
  ValidateInviteResponse,
  InviteListItem,
} from './invite.types';

/**
 * Invite Aggregator - Orchestrates invite operations
 * Calls the identity-service invite endpoints
 */
export class InviteAggregator {
  private identityClient: IdentityServiceClient;

  constructor(identityClient: IdentityServiceClient) {
    this.identityClient = identityClient;
  }

  /**
   * Create a new invite
   */
  async createInvite(
    role: 'CITY_ADMIN' | 'SOS_ADMIN' | 'SK_ADMIN',
    municipalityCode: string,
    accessToken: string,
    department?: string,
    departmentId?: string
  ): Promise<CreateInviteResponse> {
    const response = await this.identityClient.createInvite(
      role, municipalityCode, accessToken, department, departmentId);
    return response.data;
  }

  /**
   * Validate an invite (public endpoint)
   */
  async validateInvite(inviteId: string): Promise<ValidateInviteResponse> {
    const response = await this.identityClient.validateInvite(inviteId);
    return response.data;
  }

  /**
   * Accept an invite
   */
  async acceptInvite(inviteId: string, code: string, accessToken: string): Promise<any> {
    const response = await this.identityClient.acceptInvite(inviteId, code, accessToken);
    return response.data;
  }

  /**
   * List invites
   */
  async listInvites(
    role?: string,
    municipalityCode?: string,
    page: number = 1,
    limit: number = 20,
    token?: string
  ): Promise<{ invites: InviteListItem[]; total: number; page: number; limit: number }> {
    const filters = {
      ...(role && { role }),
      ...(municipalityCode && { municipalityCode }),
      page,
      limit,
    };

    const response = await this.identityClient.listInvites(filters, token);
    return response.data;
  }
}
