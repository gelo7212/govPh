import { IncidentAssignmentEntity, AssignmentStatus } from '../../types';
import { getCollection } from '../../config/database';
import { NotFoundError, DatabaseError } from '../../errors';
import { createLogger } from '../../utils/logger';
import mongoose from 'mongoose';

const logger = createLogger('AssignmentRepository');

/**
 * Assignment Repository - Data access layer
 */
export class AssignmentRepository {
  /**
   * Create a new assignment
   */
  async createAssignment(
    assignment: IncidentAssignmentEntity
  ): Promise<IncidentAssignmentEntity> {
    try {
      const collection = getCollection('incident_assignments');
      const objectId = new mongoose.Types.ObjectId();

      const result = await collection.insertOne({
        _id: objectId as any,
        incidentId: assignment.incidentId,
        cityCode: assignment.cityCode,
        departmentCode: assignment.departmentCode,
        departmentName: assignment.departmentName,
        assignedBy: assignment.assignedBy,
        status: assignment.status,
        responderId: assignment.responderId,
        notes: assignment.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (!result.acknowledged) {
        throw new DatabaseError('Failed to create assignment');
      }

      return { ...assignment, id: objectId.toString(), _id: objectId.toString() };
    } catch (error) {
      logger.error('Error creating assignment', error);
      throw new DatabaseError('Failed to create assignment');
    }
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(
    assignmentId: string
  ): Promise<IncidentAssignmentEntity> {
    try {
      const collection = getCollection('incident_assignments');
      const assignment = await collection.findOne({ _id: new mongoose.Types.ObjectId(assignmentId) });

      if (!assignment) {
        throw new NotFoundError('Assignment', assignmentId);
      }

      return this.mapDocumentToEntity(assignment);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error getting assignment', error);
      throw new DatabaseError('Failed to retrieve assignment');
    }
  }

  /**
   * Get assignments by incident ID
   */
  async getAssignmentsByIncidentId(
    incidentId: string
  ): Promise<IncidentAssignmentEntity[]> {
    try {
      const collection = getCollection('incident_assignments');
      const assignments = await collection
        .find({ incidentId })
        .sort({ createdAt: -1 })
        .toArray();

      return assignments.map((doc) => this.mapDocumentToEntity(doc));
    } catch (error) {
      logger.error('Error getting assignments by incident', error);
      throw new DatabaseError('Failed to retrieve assignments');
    }
  }

  /**
   * Get assignments by city and department
   */
  async getAssignmentsByCityAndDepartment(
    cityCode: string,
    departmentCode: string,
    status?: AssignmentStatus,
    limit: number = 50,
    skip: number = 0
  ): Promise<IncidentAssignmentEntity[]> {
    try {
      const collection = getCollection('incident_assignments');
      const query: any = { cityCode, departmentCode };

      if (status) {
        query.status = status;
      }

      const assignments = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();

      return assignments.map((doc) => this.mapDocumentToEntity(doc));
    } catch (error) {
      logger.error('Error getting assignments by city/department', error);
      throw new DatabaseError('Failed to retrieve assignments');
    }
  }

  /**
   * Get assignments by responder ID
   */
  async getAssignmentsByResponderId(
    responderId: string,
    status?: AssignmentStatus,
    limit: number = 50,
    skip: number = 0
  ): Promise<IncidentAssignmentEntity[]> {
    try {
      const collection = getCollection('incident_assignments');
      const query: any = { responderId };

      if (status) {
        query.status = status;
      }

      const assignments = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();

      return assignments.map((doc) => this.mapDocumentToEntity(doc));
    } catch (error) {
      logger.error('Error getting assignments by responder', error);
      throw new DatabaseError('Failed to retrieve assignments');
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
      const collection = getCollection('incident_assignments');
      const result = await collection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(assignmentId) },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new NotFoundError('Assignment', assignmentId);
      }

      return this.mapDocumentToEntity(result.value);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error updating assignment status', error);
      throw new DatabaseError('Failed to update assignment status');
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
      const collection = getCollection('incident_assignments');
      const result = await collection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(assignmentId) },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );
      if (!result) {
        throw new NotFoundError('Assignment', assignmentId);
      }

      return this.mapDocumentToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error updating assignment', error);
      throw new DatabaseError('Failed to update assignment');
    }
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(assignmentId: string): Promise<void> {
    try {
      const collection = getCollection('incident_assignments');
      const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(assignmentId) });

      if (result.deletedCount === 0) {
        throw new NotFoundError('Assignment', assignmentId);
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error deleting assignment', error);
      throw new DatabaseError('Failed to delete assignment');
    }
  }

  /**
   * Check if incident has pending assignment
   */
  async hasPendingAssignment(incidentId: string): Promise<boolean> {
    try {
      const collection = getCollection('incident_assignments');
      const assignment = await collection.findOne({
        incidentId,
        status: 'pending',
      });
      return !!assignment;
    } catch (error) {
      logger.error('Error checking pending assignment', error);
      return false;
    }
  }

  /**
   * Map MongoDB document to IncidentAssignmentEntity
   */
  private mapDocumentToEntity(doc: any): IncidentAssignmentEntity {
    return {
      id: doc?._id,
      _id: doc?._id,
      incidentId: doc.incidentId,
      cityCode: doc.cityCode,
      departmentCode: doc.departmentCode,
      departmentName: doc?.departmentName,
      assignedBy: doc.assignedBy,
      status: doc.status,
      responderId: doc.responderId,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

// Export singleton instance
export const assignmentRepository = new AssignmentRepository();
