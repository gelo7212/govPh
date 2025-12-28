/**
 * Incident Service Type Definitions
 */

// ==================== Incident Types ====================

export type IncidentType = 'emergency' | 'disaster' | 'accident' | 'crime' | 'medical' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high';
export type IncidentStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected' | 'cancelled';

export interface IncidentLocation {
  lat: number;
  lng: number;
  barangayCode?: string;
  cityCode: string;
}

export interface IncidentReporter {
  userId?: string;
  role: 'citizen' | 'guest';
}

export interface IncidentEntity {
  id?: string;
  _id?: string;
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

export interface CreateIncidentRequest {
  type: IncidentType;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  location: IncidentLocation;
  reporter: IncidentReporter;
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateIncidentRequest {
  type?: IncidentType;
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  location?: IncidentLocation;
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface IncidentResponse<T = any> {
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

// ==================== Assignment Types ====================

export type AssignmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type AssignedBy = 'system' | 'admin';

export interface IncidentAssignmentEntity {
  id?: string;
  _id?: string;
  incidentId: string;
  cityCode: string;
  departmentCode: string;
  assignedBy: AssignedBy;
  status: AssignmentStatus;
  responderId?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateAssignmentRequest {
  incidentId: string;
  cityCode: string;
  departmentCode: string;
  assignedBy: AssignedBy;
  responderId?: string;
  notes?: string;
}

export interface UpdateAssignmentRequest {
  incidentId?: string;
  cityCode?: string;
  departmentCode?: string;
  assignedBy?: AssignedBy;
  responderId?: string;
  notes?: string;
}

export interface AssignmentResponse<T = any> {
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
