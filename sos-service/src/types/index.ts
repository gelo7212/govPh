/**
 * Common types and interfaces for the SOS service
 */

/**
 * GeoJSON Point coordinate format
 * @property type - Must be 'Point' for GeoJSON compatibility
 * @property coordinates - [longitude, latitude] (GeoJSON standard order)
 * @note MongoDB's 2dsphere index requires GeoJSON format
 */
export interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat] - GeoJSON standard
}

/**
 * SOS Status Enumeration
 * Backend-driven state machine for SOS lifecycle
 *
 * Transitions:
 * ACTIVE -> EN_ROUTE (when rescuer assigned and en route)
 * EN_ROUTE -> ARRIVED (when rescuer arrives at location)
 * ARRIVED -> RESOLVED (when issue is resolved)
 * Any state -> CANCELLED (user or admin cancellation)
 */
export type SOSStatus = 'ACTIVE' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED' | 'CANCELLED';

/**
 * User Roles
 */
export type UserRole = 'CITIZEN' | 'ADMIN' | 'RESCUER';

/**
 * Sender Role in Messages
 */
export type SenderRole = 'citizen' | 'admin' | 'rescuer';

/**
 * SOS Type/Category
 */
export enum SOSType {
  MEDICAL = 'MEDICAL',
  FIRE = 'FIRE',
  CRIME = 'CRIME',
  ACCIDENT = 'ACCIDENT',
  DISASTER = 'DISASTER',
  OTHER = 'OTHER',
}

/**
 * Trusted headers injected by API Gateway
 * These headers are implicitly injected by the gateway
 * and should be trusted by all microservices
 */
export interface TrustedHeaders {
  'x-user-id': string;
  'x-user-role': UserRole;
  'x-city-id': string;
  'x-request-id': string;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  error: string;
  code: string;
  timestamp: Date;
  requestId?: string;
}

/**
 * Standard success response
 */
export interface SuccessResponse<T> {
  data: T;
  timestamp: Date;
  requestId?: string;
}
