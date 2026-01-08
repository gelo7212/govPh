import { deptTrackingAggregator as coreDeptTrackingAggregator } from '@gov-ph/bff-core';
import {
  CreateShareableLinkDto,
  ShareableLinkDto,
  ValidateShareableLinkDto,
  DeptTrackingLinkDto,
} from './dept-tracking.types';

/**
 * Department Tracking Aggregator
 * Handles data aggregation for department tracking operations in BFF layer
 */
export class DeptTrackingAggregator {
  /**
   * Create a shareable link for incident/assignment
   */
  async createShareableLink(
    data: CreateShareableLinkDto,
    userId: string
  ): Promise<ShareableLinkDto> {
    return await coreDeptTrackingAggregator.createShareableLink(data, userId);
  }

  /**
   * Validate a shareable link
   */
  async validateShareableLink(hashToken: string): Promise<ValidateShareableLinkDto> {
    return await coreDeptTrackingAggregator.validateShareableLink(hashToken);
  }

  /**
   * Revoke a shareable link
   */
  async revokeShareableLink(hashToken: string): Promise<void> {
    return await coreDeptTrackingAggregator.revokeShareableLink(hashToken);
  }

  /**
   * Get active shareable links for a department
   */
  async getActiveLinksByDepartment(departmentId: string): Promise<DeptTrackingLinkDto[]> {
    return await coreDeptTrackingAggregator.getActiveLinksByDepartment(departmentId);
  }
}

export const deptTrackingAggregator = new DeptTrackingAggregator();