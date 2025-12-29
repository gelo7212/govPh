import { IncidentTimelineEntity, TimelineEventType, ActorType } from '../../types';
import { incidentTimelineRepository } from './incident-timeline.repository';
import { ValidationError, NotFoundError } from '../../errors';
import {
  validateIncidentTimelinePayload,
  validateTimelineEventType,
} from '../../utils/validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('IncidentTimelineService');

/**
 * Incident Timeline Service - Business logic layer
 */
export class IncidentTimelineService {
  /**
   * Create a new timeline event
   */
  async createTimelineEvent(
    timelineData: IncidentTimelineEntity
  ): Promise<IncidentTimelineEntity> {
    try {
      validateIncidentTimelinePayload(timelineData);
      logger.info('Creating timeline event', {
        incidentId: timelineData.incidentId,
        eventType: timelineData.eventType,
      });
      return await incidentTimelineRepository.createTimelineEvent(timelineData);
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('Error creating timeline event', error);
      throw error;
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
      if (!incidentId) {
        throw new ValidationError('incidentId is required');
      }

      logger.info('Retrieving timeline events', { incidentId, limit, skip });
      return await incidentTimelineRepository.getTimelineByIncidentId(
        incidentId,
        limit,
        skip
      );
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('Error retrieving timeline events', error);
      throw error;
    }
  }

  /**
   * Get timeline event by ID
   */
  async getTimelineEventById(timelineId: string): Promise<IncidentTimelineEntity> {
    try {
      if (!timelineId) {
        throw new ValidationError('timelineId is required');
      }

      return await incidentTimelineRepository.getTimelineEventById(timelineId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error retrieving timeline event', error);
      throw error;
    }
  }

  /**
   * Get timeline events filtered by event type
   */
  async getTimelineByIncidentIdAndEventType(
    incidentId: string,
    eventType: TimelineEventType,
    limit?: number,
    skip?: number
  ): Promise<IncidentTimelineEntity[]> {
    try {
      if (!incidentId) {
        throw new ValidationError('incidentId is required');
      }

      validateTimelineEventType(eventType);

      logger.info('Retrieving filtered timeline events', {
        incidentId,
        eventType,
      });

      return await incidentTimelineRepository.getTimelineByIncidentIdAndEventType(
        incidentId,
        eventType,
        limit,
        skip
      );
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('Error retrieving filtered timeline events', error);
      throw error;
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
      if (!actorId) {
        throw new ValidationError('actorId is required');
      }

      logger.info('Retrieving timeline events by actor', {
        actorId,
        limit,
        skip,
      });

      return await incidentTimelineRepository.getTimelineByActorId(
        actorId,
        limit,
        skip
      );
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('Error retrieving timeline events by actor', error);
      throw error;
    }
  }

  /**
   * Get timeline events count for an incident
   */
  async getTimelineEventCountByIncidentId(incidentId: string): Promise<number> {
    try {
      if (!incidentId) {
        throw new ValidationError('incidentId is required');
      }

      return await incidentTimelineRepository.countTimelineEventsByIncidentId(
        incidentId
      );
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('Error counting timeline events', error);
      throw error;
    }
  }

  /**
   * Incident created timeline event
   */
    async logIncidentCreatedEvent(
        incidentId: string,
        reporterId: string,
        reporterType: ActorType,
        source: string,
        isAnonymous: boolean
    ): Promise<IncidentTimelineEntity> {
        const timelineEvent: IncidentTimelineEntity = {
        incidentId,
        actor: {
            actorId: reporterId,
            actorType: reporterType,
        },
            eventType: 'created',
            payload: {
                initialStatus: 'open',
                source: source,
                anonymous: isAnonymous,
            },
        };
        return this.createTimelineEvent(timelineEvent);
    }
    /**
     * Incident status updated timeline event
     */
    async logIncidentStatusUpdatedEvent(
        incidentId: string,
        actorId: string,
        actorType: ActorType,
        oldStatus: string,
        newStatus: string,
        reason?: string
    ): Promise<IncidentTimelineEntity> {
        const timelineEvent: IncidentTimelineEntity = {
        incidentId,
        actor: {
            actorId,
            actorType,
        },
        eventType: 'status_changed',
            payload: {
                from: oldStatus,
                to: newStatus,
                reason: reason || '',
            },
        };
        return this.createTimelineEvent(timelineEvent);
    }

    /**
     * Incident assigned timeline event
     */
    async logIncidentAssignedEvent(
        incidentId: string,
        actorId: string,
        actorType: ActorType,
        assigneeId: string,
        assignedType: string,
        departmentCode: string,
        departmentName: string
    ): Promise<IncidentTimelineEntity> {
        const timelineEvent: IncidentTimelineEntity = {
            incidentId,
            actor: {
                actorId,
                actorType,
            },
            eventType: 'assigned',
            payload: {
                assignedType:assignedType,
                departmentCode: departmentCode,
                departmentName: departmentName,
                assigneeId: assigneeId,
            },
        };
        return this.createTimelineEvent(timelineEvent);
    }

    /**
     * Incident unassigned timeline event
     */
    async logIncidentUnassignedEvent(
        incidentId: string,
        actorId: string,
        actorType: ActorType,
        assigneeId: string,
        assignedType: string,
        departmentCode: string,
        departmentName: string
    ): Promise<IncidentTimelineEntity> {
        const timelineEvent: IncidentTimelineEntity = {
            incidentId,
            actor: {
                actorId,
                actorType,
            },
            eventType: 'unassigned',
            payload: {
                assignedType:assignedType,
                departmentCode: departmentCode,
                departmentName: departmentName,
                assigneeId: assigneeId,
            },
        };
        return this.createTimelineEvent(timelineEvent);
    }

}

export const incidentTimelineService = new IncidentTimelineService();
