import { IncidentTimelineEntity } from '../../types';
import { getCollection } from '../../config/database';
import { NotFoundError, DatabaseError, ValidationError } from '../../errors';
import { createLogger } from '../../utils/logger';
import mongoose from 'mongoose';

const logger = createLogger('IncidentTimelineRepository');

/**
 * Incident Timeline Repository - Data access layer
 */
export class IncidentTimelineRepository {
  /**
   * Create a new timeline event
   */
  async createTimelineEvent(
    timelineEvent: IncidentTimelineEntity
  ): Promise<IncidentTimelineEntity> {
    try {
      const collection = getCollection('incident_timelines');
      const objectId = new mongoose.Types.ObjectId();

      const result = await collection.insertOne({
        _id: objectId,
        incidentId: timelineEvent.incidentId,
        eventType: timelineEvent.eventType,
        actor: timelineEvent.actor,
        payload: timelineEvent.payload || {},
        createdAt: new Date(),
      });

      if (!result.acknowledged) {
        throw new DatabaseError('Failed to create timeline event');
      }

      return {
        ...timelineEvent,
        _id: objectId.toString(),
        createdAt: new Date(),
      };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('Error creating timeline event', error);
      throw new DatabaseError('Failed to create timeline event');
    }
  }

  /**
   * Get timeline events by incident ID
   */
  async getTimelineByIncidentId(
    incidentId: string,
    limit?: number,
    skip?: number
  ): Promise<IncidentTimelineEntity[]> {
    try {
      const collection = getCollection('incident_timelines');
      const query = { incidentId };

      const events = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit || 0)
        .skip(skip || 0)
        .toArray();

      if (!events) {
        return [];
      }

      return events as any[];
    } catch (error) {
      logger.error('Error retrieving timeline events', error);
      throw new DatabaseError('Failed to retrieve timeline events');
    }
  }

  /**
   * Get timeline event by ID
   */
  async getTimelineEventById(
    timelineId: string
  ): Promise<IncidentTimelineEntity> {
    try {
      const collection = getCollection('incident_timelines');
      const event = await collection.findOne({  _id: new mongoose.Types.ObjectId(timelineId) });

      if (!event) {
        throw new NotFoundError('Timeline event not found');
      }

      return event as any;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error retrieving timeline event', error);
      throw new DatabaseError('Failed to retrieve timeline event');
    }
  }

  /**
   * Get timeline events by incident ID with event type filter
   */
  async getTimelineByIncidentIdAndEventType(
    incidentId: string,
    eventType: string,
    limit?: number,
    skip?: number
  ): Promise<IncidentTimelineEntity[]> {
    try {
      const collection = getCollection('incident_timelines');
      const query = { incidentId, eventType };

      const events = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit || 0)
        .skip(skip || 0)
        .toArray();

      if (!events) {
        return [];
      }

      return events as any[];
    } catch (error) {
      logger.error('Error retrieving filtered timeline events', error);
      throw new DatabaseError('Failed to retrieve timeline events');
    }
  }

  /**
   * Get timeline events by actor ID
   */
  async getTimelineByActorId(
    actorId: string,
    limit?: number,
    skip?: number
  ): Promise<IncidentTimelineEntity[]> {
    try {
      const collection = getCollection('incident_timelines');
      const query = { 'actor.actorId': actorId };

      const events = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit || 0)
        .skip(skip || 0)
        .toArray();

      if (!events) {
        return [];
      }

      return events as any[];
    } catch (error) {
      logger.error('Error retrieving timeline events by actor', error);
      throw new DatabaseError('Failed to retrieve timeline events');
    }
  }

  /**
   * Count timeline events by incident ID
   */
  async countTimelineEventsByIncidentId(incidentId: string): Promise<number> {
    try {
      const collection = getCollection('incident_timelines');
      return await collection.countDocuments({ incidentId });
    } catch (error) {
      logger.error('Error counting timeline events', error);
      throw new DatabaseError('Failed to count timeline events');
    }
  }
}

export const incidentTimelineRepository = new IncidentTimelineRepository();
