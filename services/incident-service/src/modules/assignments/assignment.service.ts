import { IncidentAssignmentEntity, AssignmentStatus } from '../../types';
import { assignmentRepository } from './assignment.repository';
import { ValidationError, NotFoundError } from '../../errors';
import { validateAssignmentCreationPayload, validateAssignmentStatus } from '../../utils/validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AssignmentService');

/**
 * Assignment Service - Business logic layer
 */
export class AssignmentService {
  /**
   * Create a new assignment
   */
  async createAssignment(
    assignmentData: IncidentAssignmentEntity
  ): Promise<IncidentAssignmentEntity> {
    try {
      validateAssignmentCreationPayload(assignmentData);
      
      logger.info('Creating assignment', {
        incidentId: assignmentData.incidentId,
        departmentCode: assignmentData.departmentCode,
      });
      
      return await assignmentRepository.createAssignment(assignmentData);
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('Error creating assignment', error);
      throw error;
    }
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(assignmentId: string): Promise<IncidentAssignmentEntity> {
    try {
      return await assignmentRepository.getAssignmentById(assignmentId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error retrieving assignment', error);
      throw error;
    }
  }

  /**
   * Get assignments by incident ID
   */
  async getAssignmentsByIncidentId(
    incidentId: string
  ): Promise<IncidentAssignmentEntity[]> {
    try {
      return await assignmentRepository.getAssignmentsByIncidentId(incidentId);
    } catch (error) {
      logger.error('Error retrieving assignments by incident', error);
      throw error;
    }
  }

  /**
   * Get assignments by city and department
   */
  async getAssignmentsByCityAndDepartment(
    cityCode: string,
    departmentCode: string,
    status?: AssignmentStatus,
    limit?: number,
    skip?: number
  ): Promise<IncidentAssignmentEntity[]> {
    try {
      return await assignmentRepository.getAssignmentsByCityAndDepartment(
        cityCode,
        departmentCode,
        status,
        limit,
        skip
      );
    } catch (error) {
      logger.error('Error retrieving assignments', error);
      throw error;
    }
  }

  /**
   * Get assignments by responder ID
   */
  async getAssignmentsByResponderId(
    responderId: string,
    status?: AssignmentStatus,
    limit?: number,
    skip?: number
  ): Promise<IncidentAssignmentEntity[]> {
    try {
      return await assignmentRepository.getAssignmentsByResponderId(
        responderId,
        status,
        limit,
        skip
      );
    } catch (error) {
      logger.error('Error retrieving assignments by responder', error);
      throw error;
    }
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(
    assignmentId: string,
    status: AssignmentStatus
  ): Promise<IncidentAssignmentEntity> {
    try {
      validateAssignmentStatus(status);

      // Get current assignment
      const assignment = await assignmentRepository.getAssignmentById(
        assignmentId
      );

      // Validate status transition
      this.validateStatusTransition(assignment.status, status);

      logger.info('Updating assignment status', {
        assignmentId,
        from: assignment.status,
        to: status,
      });

      return await assignmentRepository.updateAssignmentStatus(
        assignmentId,
        status
      );
    } catch (error) {
      logger.error('Error updating assignment status', error);
      throw error;
    }
  }

  /**
   * Update assignment
   */
  async updateAssignment(
    assignmentId: string,
    updates: Partial<IncidentAssignmentEntity>
  ): Promise<IncidentAssignmentEntity> {
    try {
      await this.getAssignmentById(assignmentId); // Verify exists
      logger.info('Updating assignment', { assignmentId });
      return await assignmentRepository.updateAssignment(assignmentId, updates);
    } catch (error) {
      logger.error('Error updating assignment', error);
      throw error;
    }
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(assignmentId: string): Promise<void> {
    try {
      await this.getAssignmentById(assignmentId); // Verify exists
      logger.info('Deleting assignment', { assignmentId });
      await assignmentRepository.deleteAssignment(assignmentId);
    } catch (error) {
      logger.error('Error deleting assignment', error);
      throw error;
    }
  }

  /**
   * Accept assignment (responder action)
   */
  async acceptAssignment(assignmentId: string): Promise<IncidentAssignmentEntity> {
    try {
      const assignment = await this.getAssignmentById(assignmentId);

      if (assignment.status !== 'pending') {
        throw new ValidationError(
          `Cannot accept assignment with status '${assignment.status}'`
        );
      }

      logger.info('Accepting assignment', { assignmentId });
      return await assignmentRepository.updateAssignmentStatus(
        assignmentId,
        'accepted'
      );
    } catch (error) {
      logger.error('Error accepting assignment', error);
      throw error;
    }
  }

  /**
   * Reject assignment
   */
  async rejectAssignment(
    assignmentId: string,
    notes?: string
  ): Promise<IncidentAssignmentEntity> {
    try {
      const assignment = await this.getAssignmentById(assignmentId);

      if (assignment.status !== 'pending' && assignment.status !== 'accepted') {
        throw new ValidationError(
          `Cannot reject assignment with status '${assignment.status}'`
        );
      }

      logger.info('Rejecting assignment', { assignmentId });
      return await assignmentRepository.updateAssignment(assignmentId, {
        status: 'rejected',
        notes: notes || assignment.notes,
      });
    } catch (error) {
      logger.error('Error rejecting assignment', error);
      throw error;
    }
  }

  /**
   * Complete assignment
   */
  async completeAssignment(assignmentId: string): Promise<IncidentAssignmentEntity> {
    try {
      const assignment = await this.getAssignmentById(assignmentId);

      if (assignment.status !== 'accepted') {
        throw new ValidationError(
          `Cannot complete assignment with status '${assignment.status}'`
        );
      }

      logger.info('Completing assignment', { assignmentId });
      return await assignmentRepository.updateAssignmentStatus(
        assignmentId,
        'completed'
      );
    } catch (error) {
      logger.error('Error completing assignment', error);
      throw error;
    }
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(
    currentStatus: AssignmentStatus,
    newStatus: AssignmentStatus
  ): void {
    const validTransitions: Record<AssignmentStatus, AssignmentStatus[]> = {
      pending: ['accepted', 'rejected'],
      accepted: ['completed', 'rejected'],
      rejected: [],
      completed: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition from '${currentStatus}' to '${newStatus}'`
      );
    }
  }
}

// Export singleton instance
export const assignmentService = new AssignmentService();
