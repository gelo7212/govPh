/**
 * Service Clients - Central export point
 */
export {
  BaseClient,
  IdentityServiceClient,
  SosServiceClient,
  ParticipantsServiceClient,
  GeoServiceClient,
  IncidentServiceClient,
  RealtimeServiceClient,
  IncidentTimelineServiceClient,
  CityServiceClient,
  EvacuationCenterServiceClient,
  DeptTrackingClient,
  SubmissionServiceClient,
  FileServiceClient,
  ServiceServiceClient,
} from './clients';

/**
 * Service Aggregators - Central export point
 */
export { IdentityAggregator } from './identity/identity.aggregator';
export { SosAggregator } from './sos/sos.aggregator';
export { ParticipantsAggregator } from './sos/participants.aggregator';
export { MessageAggregator } from './sos/message.aggregator';
export { GeoAggregator } from './geo/geo.aggregator';
export { IncidentAggregator } from './incident/incident.aggregator';
export { IncidentTimelineAggregator } from './incident/incident-timeline.aggregator';
export { CityAggregator } from './city/city.aggregator';
export { EvacuationCenterAggregator } from './evacuation/evacuation.aggregator';
export { DeptTrackingAggregator, deptTrackingAggregator } from './dept-tracking/dept-tracking.aggregator';
export { SubmissionAggregator } from './submission/submission.aggregator';
export { FileAggregator } from './file/file.aggregator';
export { ServiceAggregator } from './service/service.aggregator';

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
  IncidentTimelineEntity,
  CreateTimelineEventRequest,
  UpdateTimelineEventRequest,
  TimelineResponse,
  TimelineEventCountResponse,
  TimelineEventType,
  TimelineActor,
  PaginationOptions,
} from './types';

// Submission Service Types
export type {
  FormField,
  FormSchemaData,
  CreateFormSchemaRequest,
  UpdateFormSchemaRequest,
  FormSchemaResponse,
  SubmissionData,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  SubmissionResponse,
  DraftData,
  CreateDraftRequest,
  UpdateDraftRequest,
  DraftResponse,
  ValidationResult,
  ValidateFormDataRequest,
  ValidationResponse,
  PaginatedResponse,
  ListSchemasFilters,
  ListSubmissionsFilters,
  ListDraftsFilters,
  SchemaStatus,
  SubmissionStatus,
} from './submission/submission.types';

// File Service Types
export type {
  FileEntity,
  UploadFileRequest,
  UploadFileResponse,
  ListFilesQuery,
  DeleteFileRequest,
  DeleteFileResponse,
  FileResponse,
  FilesListResponse,
  FileMetadata,
  StorageProvider,
  Visibility,
  OwnerType,
} from './file/file.types';

export { UserContext } from './clients/base.client';
