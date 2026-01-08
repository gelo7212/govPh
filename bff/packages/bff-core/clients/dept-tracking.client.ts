import { BaseClient, UserContext } from './base.client';

export interface CreateShareableLinkRequest {
  cityId: string;
  departmentId: string;
  scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE';
  assignmentId?: string;
  incidentId: string;
  createdBy: string;
}

export interface ShareableLinkResponse {
  jwt: string;
  expiresAt: string;
}

export interface ValidateShareableLinkResponse {
  cityId: string;
  departmentId: string;
  scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE';
  assignmentId?: string;
  expiresAt: string;
}

export interface DeptTrackingLink {
  jwt: string;
  scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE';
  assignmentId?: string;
  expiresAt: string;
}

/**
 * Department Tracking Service Client
 * Shared client for communicating with the incident-service microservice
 */
export class DeptTrackingClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
  }

  /**
   * Create a shareable link for department/assignment tracking
   * POST /dept-tracking/create
   */
  async createShareableLink(data: CreateShareableLinkRequest): Promise<ShareableLinkResponse> {
    try {
      const response = await this.client.post('/dept-tracking/create', data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating shareable link:', error);
      return this.handleError(error);
    }
  }

  /**
   * Validate a shareable link
   * GET /dept-tracking/validate/:hashToken
   */
  async validateShareableLink(hashToken: string): Promise<ValidateShareableLinkResponse> {
    try {
      const response = await this.client.get(`/dept-tracking/validate/${hashToken}`);
      return response.data?.data || response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Revoke a shareable link
   * DELETE /dept-tracking/revoke/:hashToken
   */
  async revokeShareableLink(hashToken: string): Promise<{ message: string }> {
    try {
      const response = await this.client.delete(`/dept-tracking/revoke/${hashToken}`);
      return response.data?.data || response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get active shareable links for a department
   * GET /dept-tracking/department/:departmentId
   */
  async getActiveLinksByDepartment(departmentId: string): Promise<DeptTrackingLink[]> {
    try {
      const response = await this.client.get(`/dept-tracking/department/${departmentId}`);
      return response.data?.data || response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}