import { DeptTrackingToken, IDeptTrackingToken } from './dept-tracking.mongo.schema';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DeptTrackingRepository');

export class DeptTrackingRepository {
  async create(data: Partial<IDeptTrackingToken>): Promise<IDeptTrackingToken> {
    const token = new DeptTrackingToken(data);
    return await token.save();
  }

  async findByToken(token: string): Promise<IDeptTrackingToken | null> {
    return await DeptTrackingToken.findOne({ jwt: token, revokedAt: null });
  }

  async findAll(): Promise<IDeptTrackingToken[]> {
    return await DeptTrackingToken.find({});
  }

  async findById(id: string): Promise<IDeptTrackingToken | null> {
    return await DeptTrackingToken.findById(id);
  }

  async revokeToken(hashToken: string): Promise<void> {
    await DeptTrackingToken.updateOne(
      { hashToken },
      { revokedAt: new Date() }
    );
  }

  async findActiveByDepartment(departmentId: string): Promise<IDeptTrackingToken[]> {
    return await DeptTrackingToken.find({
      departmentId,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    });
  }

  async findActiveByAssignment(assignmentId: string): Promise<IDeptTrackingToken[]> {
    return await DeptTrackingToken.find({
      assignmentId,
      scope: 'ASSIGNMENT_ONLY',
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    });
  }
}

// Export singleton instance
export const deptTrackingRepository = new DeptTrackingRepository();