import { IncidentTimelineServiceClient } from '../clients/incident-timeline.client';
import {
  IncidentTimelineEntity,
  CreateTimelineEventRequest,
  UpdateTimelineEventRequest,
  TimelineResponse,
  TimelineEventCountResponse,
  PaginationOptions,
} from './incident-timeline.types';

/**
 * Incident Timeline Aggregator - Shared orchestration layer
 * Handles incident timeline management across all BFF services
 */
export class IncidentTimelineAggregator {
  constructor(private timelineClient: IncidentTimelineServiceClient) {}

  // ==================== Timeline Event Operations ====================

  /**
   * Create a new timeline event
   */
  async createTimelineEvent(
    data: CreateTimelineEventRequest
  ): Promise<TimelineResponse<IncidentTimelineEntity>> {
    const result = await this.timelineClient.createTimelineEvent(data);
    return result;
  }

  /**
   * Get timeline event by ID
   */
  async getTimelineEventById(timelineId: string): Promise<TimelineResponse<IncidentTimelineEntity>> {
    const timeline = await this.timelineClient.getTimelineEventById(timelineId);
    return timeline;
  }

  /**
   * Get timeline events by incident ID
   */
  async getTimelineByIncidentId(
    incidentId: string,
    options?: PaginationOptions
  ): Promise<TimelineResponse<IncidentTimelineEntity[]>> {
    const timeline = await this.timelineClient.getTimelineByIncidentId(
      incidentId,
      options?.limit || 100,
      options?.skip || 0
    );
    return timeline;
  }

  /**
   * Get timeline events filtered by event type
   */
  async getTimelineByIncidentIdAndEventType(
    incidentId: string,
    eventType: string,
    options?: PaginationOptions
  ): Promise<TimelineResponse<IncidentTimelineEntity[]>> {
    const timeline = await this.timelineClient.getTimelineByIncidentIdAndEventType(
      incidentId,
      eventType,
      options?.limit || 100,
      options?.skip || 0
    );
    return timeline;
  }

  /**
   * Get timeline events by actor ID
   */
  async getTimelineByActorId(
    actorId: string,
    options?: PaginationOptions
  ): Promise<TimelineResponse<IncidentTimelineEntity[]>> {
    const timeline = await this.timelineClient.getTimelineByActorId(
      actorId,
      options?.limit || 100,
      options?.skip || 0
    );
    return timeline;
  }

  /**
   * Get timeline event count for an incident
   */
  async getTimelineEventCountByIncidentId(
    incidentId: string
  ): Promise<TimelineResponse<TimelineEventCountResponse>> {
    const count = await this.timelineClient.getTimelineEventCountByIncidentId(incidentId);
    return count;
  }

  /**
   * Get all timeline events for an incident with advanced filtering
   */
  async getTimelineWithFilters(
    incidentId: string,
    filters?: {
      eventType?: string;
      actorId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    options?: PaginationOptions
  ): Promise<TimelineResponse<IncidentTimelineEntity[]>> {
    if (filters?.eventType) {
      return this.getTimelineByIncidentIdAndEventType(
        incidentId,
        filters.eventType,
        options
      );
    }

    return this.getTimelineByIncidentId(incidentId, options);
  }
}
