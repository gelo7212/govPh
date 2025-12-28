import { IncidentEntity, IncidentStatus } from '../../types';
import { getCollection } from '../../config/database';
import { NotFoundError, DatabaseError, ValidationError } from '../../errors';
import { createLogger } from '../../utils/logger';
import mongoose from 'mongoose';

const logger = createLogger('IncidentRepository');

/**
 * Incident Repository - Data access layer
 */
export class IncidentRepository {
  /**
   * Create a new incident
   */
  async createIncident(incident: IncidentEntity): Promise<IncidentEntity> {
    try {
      const collection = getCollection('incidents');
      const objectId = new mongoose.Types.ObjectId();

      const result = await collection.insertOne({
        _id: objectId as any,
        type: incident.type,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        location: incident.location,
        reporter: incident.reporter,
        attachments: incident.attachments,
        metadata: incident.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (!result.acknowledged) {
        throw new DatabaseError('Failed to create incident');
      }

      return { ...incident, id: objectId.toString(), _id: objectId.toString() };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('Error creating incident', error);
      throw new DatabaseError('Failed to create incident');
    }
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(incidentId: string): Promise<IncidentEntity> {
    try {
      const collection = getCollection('incidents');
      const incident = await collection.findOne({ _id: new mongoose.Types.ObjectId(incidentId) });

      if (!incident) {
        throw new NotFoundError('Incident', incidentId);
      }

      return this.mapDocumentToEntity(incident);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error getting incident', error);
      throw new DatabaseError('Failed to retrieve incident');
    }
  }

  /**
   * Get incidents by city code
   */
  async getIncidentsByCity(
    cityCode: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<IncidentEntity[]> {
    try {
      const collection = getCollection('incidents');
      const incidents = await collection
        .find({ 'location.cityCode': cityCode })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();

      return incidents.map((doc) => this.mapDocumentToEntity(doc));
    } catch (error) {
      logger.error('Error getting incidents by city', error);
      throw new DatabaseError('Failed to retrieve incidents');
    }
  }

  /**
   * Get incidents by user ID
   */
  async getIncidentsByUserId(
    userId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<IncidentEntity[]> {
    try {
      const collection = getCollection('incidents');
      const incidents = await collection
        .find({ 'reporter.userId': userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();

      return incidents.map((doc) => this.mapDocumentToEntity(doc));
    } catch (error) {
      logger.error('Error getting incidents by user', error);
      throw new DatabaseError('Failed to retrieve incidents');
    }
  }

  /**
   * Get all incidents with pagination
   */
  async getAllIncidents(
    limit: number = 50,
    skip: number = 0
  ): Promise<IncidentEntity[]> {
    try {
      const collection = getCollection('incidents');
      const incidents = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();

      return incidents.map((doc) => this.mapDocumentToEntity(doc));
    } catch (error) {
      logger.error('Error getting all incidents', error);
      throw new DatabaseError('Failed to retrieve incidents');
    }
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus
  ): Promise<IncidentEntity> {
    try {
      const collection = getCollection('incidents');
      const result = await collection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(incidentId) },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result || !result.value) {
        throw new NotFoundError('Incident', incidentId);
      }

      return this.mapDocumentToEntity(result.value);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error updating incident status', error);
      throw new DatabaseError('Failed to update incident status');
    }
  }

  /**
   * Update incident
   */
  async updateIncident(
    incidentId: string,
    updates: Partial<IncidentEntity>
  ): Promise<IncidentEntity> {
    try {
      const collection = getCollection('incidents');
      const result = await collection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(incidentId) },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result || !result.value) {
        throw new NotFoundError('Incident', incidentId);
      }

      return this.mapDocumentToEntity(result.value);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error updating incident', error);
      throw new DatabaseError('Failed to update incident');
    }
  }

  /**
   * Delete incident
   */
  async deleteIncident(incidentId: string): Promise<void> {
    try {
      const collection = getCollection('incidents');
      const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(incidentId) });

      if (result.deletedCount === 0) {
        throw new NotFoundError('Incident', incidentId);
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error deleting incident', error);
      throw new DatabaseError('Failed to delete incident');
    }
  }

  /**
   * Get incident count by city
   */
  async getIncidentCountByCity(cityCode: string): Promise<number> {
    try {
      const collection = getCollection('incidents');
      return await collection.countDocuments({ 'location.cityCode': cityCode });
    } catch (error) {
      logger.error('Error counting incidents', error);
      throw new DatabaseError('Failed to count incidents');
    }
  }

  /**
   * Map MongoDB document to IncidentEntity
   */
  private mapDocumentToEntity(doc: any): IncidentEntity {
    return {
      id: doc._id,
      _id: doc._id,
      type: doc.type,
      title: doc.title,
      description: doc.description,
      severity: doc.severity,
      status: doc.status,
      location: doc.location,
      reporter: doc.reporter,
      attachments: doc.attachments,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

// Export singleton instance
export const incidentRepository = new IncidentRepository();
