import { Request } from 'express';

/**
 * Request User Context
 */
export interface RequestUser {
  userId?: string;
  firebaseUid?: string;
  role: 'citizen' | 'guest' | 'app_admin' | 'city_admin' | 'sos_admin';
  cityCode?: string;
  departmentCode?: string;
}

/**
 * Standard API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
}

/**
 * Express Request with User
 */
export interface AuthRequest extends Request {
  user?: RequestUser;
}

/**
 * Incident Type Enum
 */
export type IncidentType = 'emergency' | 'disaster' | 'accident' | 'crime' | 'medical' | 'road' | 'public_infrastructure' | 'utility' | 'sanitation' | 'facility' | 'social_assistance' | 'safety_hazard' | 'other';

/**
 * Incident Severity
 */
export type IncidentSeverity = 'low' | 'medium' | 'high';

/**
 * Incident Status
 */
export type IncidentStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected' | 'for_review' | 'cancelled';

/**
 * Incident Reporter
 */
export interface IncidentReporter {
  userId?: string;
  role: 'citizen' | 'guest';
}

/**
 * Incident Location
 */
export interface IncidentLocation {
  lat: number;
  lng: number;
  barangayCode?: string;
  cityCode: string;
  cityId: string;
}

/**
 * Incident Entity
 */
export interface IncidentEntity {
  _id?: string;
  id?: string;
  type: IncidentType;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: IncidentLocation;
  reporter: IncidentReporter;
  attachments?: string[];
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Assignment Status
 */
export type AssignmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

/**
 * Assignment Entity
 */
export interface IncidentAssignmentEntity {
  _id?: string;
  id?: string;
  incidentId: string;
  cityCode: string;
  departmentCode: string;
  departmentName?: string;
  assignedBy: 'system' | 'admin';
  status: AssignmentStatus;
  responderId?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Timeline Event Type
 */
export type TimelineEventType =
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'acknowledged'
  | 'note_added'
  | 'attachment_added'
  | 'resolved'
  | 'rejected'
  | 'escalated'
  | 'unassigned';

/**
 * Actor Type
 */
export type ActorType = 'citizen' | 'guest' | 'admin' | 'rescuer' | 'system';

/**
 * Timeline Actor
 */
export interface TimelineActor {
  actorType: ActorType;
  actorId?: string;
}

/**
 * Incident Timeline Entity
 */
export interface IncidentTimelineEntity {
  _id?: string;
  id?: string;
  incidentId: string;
  eventType: TimelineEventType;
  actor: TimelineActor;
  payload?: Record<string, any>;
  createdAt?: Date;
}
