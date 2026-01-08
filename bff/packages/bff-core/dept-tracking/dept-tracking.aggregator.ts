import { DeptTrackingClient } from '../clients/dept-tracking.client';
import {
  CreateShareableLinkDto,
  ShareableLinkDto,
  ValidateShareableLinkDto,
  DeptTrackingLinkDto,
} from './dept-tracking.types';

/**
 * Department Tracking Aggregator
 * Handles data aggregation for department tracking operations
 */
export class DeptTrackingAggregator {
  private client: DeptTrackingClient;

  constructor() {
    this.client = new DeptTrackingClient(
      process.env.INCIDENT_SERVICE_URL || 'http://govph-incident:3000'
    );
  }

  /**
   * Create a shareable link for incident/assignment
   */
  async createShareableLink(data: CreateShareableLinkDto, userId: string): Promise<ShareableLinkDto> {
    try {
      const response = await this.client.createShareableLink({
        ...data,
        createdBy: userId,
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to create shareable link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate a shareable link
   */
  async validateShareableLink(hashToken: string): Promise<ValidateShareableLinkDto> {
    try {
      const response = await this.client.validateShareableLink(hashToken);
      return response;
    } catch (error) {
      throw new Error(`Failed to validate shareable link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Revoke a shareable link
   */
  async revokeShareableLink(hashToken: string): Promise<void> {
    try {
      await this.client.revokeShareableLink(hashToken);
    } catch (error) {
      throw new Error(`Failed to revoke shareable link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get active shareable links for a department
   */
  async getActiveLinksByDepartment(departmentId: string): Promise<DeptTrackingLinkDto[]> {
    try {
      const response = await this.client.getActiveLinksByDepartment(departmentId);
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get active links for department: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const deptTrackingAggregator = new DeptTrackingAggregator();