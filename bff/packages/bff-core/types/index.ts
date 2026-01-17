/**
 * Shared Type Definitions
 */

/**
 * Citizen Registration Data Structure
 */
export interface CitizenRegistrationData {
  email: string;
  phone: string;
  displayName: string;
  firebaseUid: string;
  address: {
    municipalityId: string;
    street: string;
    city: string;
    barangay: string;
    province: string;
    postalCode: string;
    country: string;
  };
  user?: {
    id: string;
  };
}

export interface AdminRegistrationData {
  email: string;
  phone: string;
  displayName: string;
  firebaseUid: string;
  inviteId: string;
  code: string;
}
// Identity Types
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAddress {
  street: string;
  city: string;
  barangay: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface UserProfile {
  id: string;
  firebaseUid: string;
  role: string;
  email: string;
  phone: string;
  displayName: string;
  municipalityCode: string;
  department: string | null;
  registrationStatus: string;
  createdAt: string;
  updatedAt: string;
  address: UserAddress;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
}

// SOS Types
export interface SosLocation {
  latitude: number;
  longitude: number;
}

export interface CreateSosRequest {
  userId: string;
  location: SosLocation;
  description: string;
  type: 'medical' | 'fire' | 'rescue' | 'other';
}

export interface SosRequest {
  id: string;
  userId: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
  location: SosLocation;
  description: string;
  type: string;
  assignedRescuerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SosResponse {
  success: boolean;
  data: {
    id: string;
    userId: string;
    status: string;
    description: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    sosNo?: string;
  };
  timestamp: string;
}

// Geo Types
export interface Boundary {
  id: string;
  name: string;
  type: string;
  geometry: any; // GeoJSON geometry
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoundarySearchResult {
  id: string;
  name: string;
  type: string;
  distance?: number;
}

export interface Municipality {
  _id: string;
  code: string;
  name: string;
  type: string;
  district: string;
  zip_code: string;
  region: string;
  province: string;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Request Context
export interface RequestContext {
  user?: User;
  requestId: string;
  timestamp: Date;
}

// Error Response
export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}
// Incident Types
export type IncidentType = 'emergency' | 'disaster' | 'accident' | 'crime';
export type IncidentStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';
export type AssignmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface IncidentLocation {
  lat: number;
  lng: number;
  cityCode: string;
  barangayCode?: string;
}

export interface IncidentReporter {
  userId?: string;
  role: 'citizen' | 'guest';
}

export interface IncidentEntity {
  id: string;
  type: IncidentType;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high';
  status: IncidentStatus;
  location: IncidentLocation;
  reporter: IncidentReporter;
  attachments: string[];
  metadata: Record<string, any>;
  timeline?: IncidentTimelineEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncidentRequest {
  type: IncidentType;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high';
  location: IncidentLocation;
  reporter: IncidentReporter;
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateIncidentRequest {
  type?: IncidentType;
  title?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
  location?: IncidentLocation;
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface IncidentAssignmentEntity {
  id: string;
  incidentId: string;
  cityCode: string;
  departmentCode: string;
  assignedBy: 'system' | 'admin';
  status: AssignmentStatus;
  responderId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAssignmentRequest {
  incidentId: string;
  cityCode: string;
  departmentCode: string;
  assignedBy: 'system' | 'admin';
  responderId?: string;
  notes?: string;
}

export interface UpdateAssignmentRequest {
  responderId?: string;
  notes?: string;
}

export interface IncidentResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: Date;
}

export interface AssignmentResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: Date;
}

// Incident Timeline Types
export type TimelineEventType =
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'acknowledged'
  | 'in_progress'
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

// City Service Types
export {
  type CityData,
  type CreateCityRequest,
  type UpdateCityRequest,
  type CityResponse,
  type DepartmentData,
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest,
  type DepartmentResponse,
  type SosHQData,
  type CreateSosHQRequest,
  type UpdateSosHQRequest,
  type SosHQResponse,
  type CityConfigData,
  type CreateCityConfigRequest,
  type UpdateCityConfigRequest,
  type CityConfigResponse,
  type CityConfigIncidentRules,
  type CityConfigSosRules,
  type CityConfigVisibilityRules,
  type CityConfigSetup,
  type CityLocation,
  type SosHQLocation,
} from './city.types';

// Evacuation Center Types
export {
  type EvacuationCenterData,
  type EvacuationCenterLocation,
  type EvacuationCenterCapacity,
  type EvacuationCenterFacilities,
  type EvacuationCenterContactPerson,
  type CreateEvacuationCenterRequest,
  type UpdateEvacuationCenterRequest,
  type EvacuationCenterResponse,
  type UpdateCapacityRequest,
  type UpdateStatusRequest,
} from '../evacuation/evacuation.types';

export {
  type ServiceEntity,
  type CreateServiceRequest,
  type UpdateServiceRequest,
  type ServiceResponse,
  type ServiceCategory,
  type ServiceFormConfig,
  type ServiceAvailability,
} from '../service/service.types';