/**
 * Service Clients - Central export point
 */
export {
  BaseClient,
  IdentityServiceClient,
  SosServiceClient,
  GeoServiceClient,
} from './clients';

/**
 * Service Aggregators - Central export point
 */
export { IdentityAggregator } from './identity/identity.aggregator';
export { SosAggregator } from './sos/sos.aggregator';
export { GeoAggregator } from './geo/geo.aggregator';

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
} from './types';
