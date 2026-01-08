import { deptTrackingRepository } from './dept-tracking.repository';
import { IDeptTrackingToken } from './dept-tracking.mongo.schema';
import { identityClient } from '../../services/identity.client';
import crypto from 'crypto';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DeptTrackingService');

export class DeptTrackingService {
  async createShareableLink(data: {
    cityId: string;
    departmentId: string;
    scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE';
    assignmentId?: string;
    incidentId: string;
    createdBy: string;
    expiresAt?: Date;
  }): Promise<{ success: boolean; data: { token: string; expiresAt: Date } }> {
    

    // Generate JWT via identity service
    const contextUsage = data.scope === 'ASSIGNMENT_ONLY' ? 'REPORT_ASSIGNMENT' : 'REPORT_ASSIGNMENT_DEPARTMENT';
    const jwt = await identityClient.generateShareLinkToken(
      data.incidentId,
      data.cityId, 
      contextUsage,
      data.assignmentId,
      data.departmentId
    );

    if (!jwt) {
      throw new Error('Failed to generate JWT token');
    }

    console.log('Generated JWT token for shareable link', jwt);

     //

    // Create token record
    const token = await deptTrackingRepository.create({
      jwt: jwt.data.token,
      cityId: data.cityId,
      departmentId: data.departmentId,
      scope: data.scope,
      assignmentId: data.assignmentId,
      expiresAt: new Date(Date.now() + (Number(jwt.data.expiresAt) * 1000)), // Convert seconds to milliseconds and add to now
      createdBy: data.createdBy,
    });

    return { ...jwt };
  }

  async validateShareableLink(token: string): Promise<IDeptTrackingToken | null> {
    const tokenRecord = await deptTrackingRepository.findByToken(token);

    if (!tokenRecord) {
      return null;
    }

    // Check if expired
    if (tokenRecord.expiresAt < new Date()) {
      return null;
    }

    return tokenRecord;
  }

  async revokeShareableLink(token: string): Promise<void> {
    await deptTrackingRepository.revokeToken(token);
  }

  async getActiveLinksByDepartment(departmentId: string): Promise<IDeptTrackingToken[]> {
    return await deptTrackingRepository.findActiveByDepartment(departmentId);
  }

  async getActiveLinksByAssignment(assignmentId: string): Promise<IDeptTrackingToken[]> {
    return await deptTrackingRepository.findActiveByAssignment(assignmentId);
  }

}

// Export singleton instance
export const deptTrackingService = new DeptTrackingService();