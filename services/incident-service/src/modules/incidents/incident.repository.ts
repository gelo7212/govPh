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

  async getIncidentsByIds(ids: string[]): Promise<IncidentEntity[]> {
    try {
      const collection = getCollection('incidents');
        const incidents = await collection
        .find({ _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } })
        .sort({ createdAt: -1 })
        .toArray();
      return incidents.map((doc) => this.mapDocumentToEntity(doc));
    }
    catch (error) {
      logger.error('Error getting incidents by department ID', error);
      throw new DatabaseError('Failed to retrieve incidents by department ID');
    }
  }

  /**
   * Get incidents by city code with filters and sorting
   */
  async getIncidentsByCity(
    cityCode: string,
    limit: number = 50,
    skip: number = 0,
    filters?: {
      search?: string;
      severity?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<IncidentEntity[]> {
    try {
      const collection = getCollection('incidents');
      
      // Build query conditions array
      const conditions: any[] = [{ 'location.cityCode': cityCode }];

      // Add search filter (search in title or description)
      if (filters?.search) {
        conditions.push({
          $or: [
            { title: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } },
          ],
        });
      }

      // Add severity filter
      if (filters?.severity) {
        conditions.push({ severity: filters.severity });
      }

      // Add status filter
      if (filters?.status) {
        conditions.push({ status: filters.status });
      }

      // Add date range filter
      if (filters?.startDate || filters?.endDate) {
        const dateFilter: any = {};
        if (filters.startDate) {
          dateFilter.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          dateFilter.$lte = new Date(filters.endDate);
        }
        conditions.push({ createdAt: dateFilter });
      }

      // Build final query with $and to ensure all conditions are met
      const query = conditions.length > 1 ? { $and: conditions } : conditions[0];

      // Build sort object
      const sortObj: any = {};
      const validSortFields = ['severity', 'status', 'title', 'createdAt'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;

      const incidents = await collection
        .find(query)
        .sort(sortObj)
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

      if (!result) {
        throw new NotFoundError('Incident', incidentId);
      }

      return this.mapDocumentToEntity(result);
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
   * Get incident count by city with optional filters
   */
  async getIncidentCountByCity(
    cityCode: string,
    filters?: {
      search?: string;
      severity?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<number> {
    try {
      const collection = getCollection('incidents');
      
      // Build query conditions array
      const conditions: any[] = [{ 'location.cityCode': cityCode }];

      // Add search filter
      if (filters?.search) {
        conditions.push({
          $or: [
            { title: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } },
          ],
        });
      }

      // Add severity filter
      if (filters?.severity) {
        conditions.push({ severity: filters.severity });
      }

      // Add status filter
      if (filters?.status) {
        conditions.push({ status: filters.status });
      }

      // Add date range filter
      if (filters?.startDate || filters?.endDate) {
        const dateFilter: any = {};
        if (filters.startDate) {
          dateFilter.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          dateFilter.$lte = new Date(filters.endDate);
        }
        conditions.push({ createdAt: dateFilter });
      }

      // Build final query with $and to ensure all conditions are met
      const query = conditions.length > 1 ? { $and: conditions } : conditions[0];

      return await collection.countDocuments(query);
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
