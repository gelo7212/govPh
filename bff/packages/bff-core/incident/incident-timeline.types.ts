/**
 * Incident Timeline Service Type Definitions
 */

// ==================== Timeline Event Types ====================

export type TimelineEventType =
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'acknowledged'
  | 'resolved'
  | 'rejected'
  | 'cancelled'
  | 'comment_added'
  | 'attachment_added'
  | 'location_updated'
  | 'severity_updated'
  | 'responder_arrived'
  | 'responder_departed'
  | 'other';

export interface TimelineActor {
  id: string;
  type: 'citizen' | 'responder' | 'dispatcher' | 'system' | 'admin';
  name?: string;
}

export interface IncidentTimelineEntity {
  id?: string;
  _id?: string;
  incidentId: string;
  eventType: TimelineEventType;
  actor: TimelineActor;
  payload?: Record<string, any>;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTimelineEventRequest {
  incidentId: string;
  eventType: TimelineEventType;
  actor: TimelineActor;
  payload?: Record<string, any>;
  description?: string;
}

export interface UpdateTimelineEventRequest {
  eventType?: TimelineEventType;
  actor?: TimelineActor;
  payload?: Record<string, any>;
  description?: string;
}

export interface TimelineResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
  pagination?: {
    total?: number;
    limit: number;
    skip: number;
  };
}

export interface TimelineEventCountResponse {
  incidentId: string;
  count: number;
}

export interface PaginationOptions {
  limit?: number;
  skip?: number;
}
