/**
 * Service Clients - Central export point
 */
export {
  BaseClient,
  IdentityServiceClient,
  SosServiceClient,
  GeoServiceClient,
  IncidentServiceClient,
  RealtimeServiceClient,
} from './clients';

/**
 * Service Aggregators - Central export point
 */
export { IdentityAggregator } from './identity/identity.aggregator';
export { SosAggregator } from './sos/sos.aggregator';
export { MessageAggregator } from './sos/message.aggregator';
export { GeoAggregator } from './geo/geo.aggregator';
export { IncidentAggregator } from './incident/incident.aggregator';

/**
 * Error Handling Utilities - Central export point
 */
export {
  handleServiceError,
  sendErrorResponse,
  type ErrorInfo,
} from './utils/errorHandler';

/**
 * Shared Types - Central export point
 */
export type {
  User,
  LoginRequest,
  LoginResponse,
  AuthToken,
  SosLocation,
  CreateSosRequest,
  SosRequest,
  Boundary,
  BoundarySearchResult,
  RequestContext,
  ErrorResponse,
  IncidentEntity,
  IncidentAssignmentEntity,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  IncidentResponse,
  AssignmentResponse,
  IncidentType,
  IncidentStatus,
  AssignmentStatus,
} from './types';

export { UserContext } from './clients/base.client';