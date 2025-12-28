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
export type IncidentType = 'emergency' | 'disaster' | 'accident' | 'crime' | 'medical' | 'other';

/**
 * Incident Severity
 */
export type IncidentSeverity = 'low' | 'medium' | 'high';

/**
 * Incident Status
 */
export type IncidentStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';

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
  assignedBy: 'system' | 'admin';
  status: AssignmentStatus;
  responderId?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
