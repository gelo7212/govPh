import { IncidentTimelineEntity, TimelineResponse } from '../incident/incident-timeline.types';
import { BaseClient, UserContext } from './base.client';

/**
 * Incident Timeline Service Client
 * Shared client for communicating with the incident-ms microservice timeline endpoints
 */
export class IncidentTimelineServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
  }

  // ==================== Timeline Event Endpoints ====================

  /**
   * Create a new timeline event
   */
  async createTimelineEvent(data: any): Promise<any> {
    try {
      const response = await this.client.post('/incident-timelines', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get timeline event by ID
   */
  async getTimelineEventById(timelineId: string): Promise<any> {
    try {
      const response = await this.client.get(`/incident-timelines/${timelineId}/event`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get timeline events by incident ID
   */
  async getTimelineByIncidentId(
    incidentId: string,
    limit: number = 100,
    skip: number = 0
  ): Promise<TimelineResponse<[IncidentTimelineEntity]>> {
    try {
      const response = await this.client.get(`/incident-timelines/${incidentId}`, {
        params: { limit, skip },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get timeline events filtered by event type
   */
  async getTimelineByIncidentIdAndEventType(
    incidentId: string,
    eventType: string,
    limit: number = 100,
    skip: number = 0
  ): Promise<any> {
    try {
      const response = await this.client.get(`/incident-timelines/${incidentId}/events`, {
        params: { eventType, limit, skip },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get timeline events by actor ID
   */
  async getTimelineByActorId(
    actorId: string,
    limit: number = 100,
    skip: number = 0
  ): Promise<any> {
    try {
      const response = await this.client.get(`/incident-timelines/actor/${actorId}`, {
        params: { limit, skip },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get timeline event count for an incident
   */
  async getTimelineEventCountByIncidentId(incidentId: string): Promise<any> {
    try {
      const response = await this.client.get(`/incident-timelines/${incidentId}/count`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
