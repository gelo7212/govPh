/**
 * User Role Types - Authoritative role definitions
 * Only exists in authenticated identity context
 */
export type UserRole = 'APP_ADMIN' | 'CITY_ADMIN' | 'SOS_ADMIN' | 'CITIZEN' | 'RESCUER';

/**
 * Actor Type - WHO IS ACTING RIGHT NOW?
 * Simple determination: is there an authenticated identity or not?
 * 
 * USER: Has identity + role (role distinguishes CITIZEN/RESCUER/ADMIN)
 * ANON: No identity, no role (scopes come from mission context)
 * SYSTEM: Internal service calls (identity optional)
 */
export type ActorType = 'USER' | 'ANON' | 'SYSTEM';

/**
 * Identity Claims Block (OPTIONAL in token, but REQUIRED fields when present)
 * Only present for authenticated users with actorType: 'USER'
 * If absent → user is anonymous (actorType: 'ANON')
 * 
 * When identity exists, userId + firebaseUid + role are all REQUIRED
 */
export interface IdentityClaims {
  userId?: string;      // USER-UUID (must exist if identity block present)
  firebaseUid?: string; // Firebase UID (must exist if identity block present)
  role: UserRole;      // Role ALWAYS exists when identity block present
}

/**
 * Actor Context Block (REQUIRED in every token)
 * Simple context: WHO IS ACTING (authenticated vs anonymous) and WHERE (cityCode)
 */
export interface ActorContext {
  type: ActorType; // USER (has identity+role) | ANON (no identity) | SYSTEM
  cityCode: string; // Municipality code (CALUMPIT, APALIT, etc) - always needed for ACL
}

/**
 * Mission Context Block (OPTIONAL)
 * Present ONLY when token is bound to SOS or rescue operation
 * Scopes moved here - they only matter in mission/SOS context
 */
export interface MissionContext {
  sosId: string;                // Active SOS incident (REQUIRED if mission block present)
  rescuerMissionId?: string;    // RMT ID (NOT rescuer identity, mission-scoped)
  scopes?: string[];            // Resolved permissions for mission context (OPTIONAL)
}

/**
 * JWT Token Payload
 * Clean separation: Identity | Actor | Mission
 * 
 * PRINCIPLE: "WHO IS THIS REQUEST ACTING AS, RIGHT NOW?"
 * 
 * RULES:
 * - actor.type: 'USER' REQUIRES identity block with userId + firebaseUid + role
 * - actor.type: 'ANON' MUST NOT have identity block
 * - actor.type: 'SYSTEM' may or may not have identity
 * - mission block REQUIRES sosId, may include rescuerMissionId and scopes
 */
export interface JwtPayload {
  // Standard JWT claims
  iss: string; // Issuer: "identity.e-citizen"
  aud: string; // Audience: "e-citizen"
  exp: number; // Expiration time (Unix timestamp)
  iat: number; // Issued at (Unix timestamp)

  // Identity Block (OPTIONAL)
  // Present only for authenticated users (actor.type: 'USER')
  // When present, MUST include userId, firebaseUid, and role
  identity?: IdentityClaims;

  // Actor Context Block (REQUIRED)
  // Answers: "Is this authenticated? Where are they from?"
  actor: ActorContext;

  // Mission Context Block (OPTIONAL)
  // Present only when token is bound to SOS/rescue incident
  mission?: MissionContext;
  tokenType: 'access' | 'refresh';
}

/**
 * Token Response
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Seconds until expiration
  tokenType: 'Bearer';
}

/**
 * Token Validation Result
 */
export interface TokenValidationResult {
  valid: boolean;
  payload?: JwtPayload;
  error?: string;
}

/**
 * Revoked Token Entry (for blacklist)
 */
export interface RevokedToken {
  id: string;
  tokenHash: string; // SHA256 hash of token
  userId: string;
  revokedAt: Date;
  expiresAt: Date;
}

/**
 * Registration Status - User account lifecycle states
 */
export type RegistrationStatus = 'pending' | 'active' | 'suspended' | 'archived';

/**
 * Department Classifications for sos_admin
 */
export type Department = 'MDRRMO' | 'PNP' | 'BFP' | 'LGU';

/**
 * User Entity - Authoritative user model
 * Governs all identity and access control decisions
 */
export interface UserEntity {
  id?: string;
  firebaseUid: string;

  role: UserRole;

  email?: string;
  phone?: string;
  displayName?: string;

  // LGU-specific: REQUIRED for CITY_ADMIN & SOS_ADMIN
  municipalityCode?: string;
  department?: Department;

  registrationStatus: RegistrationStatus;

  createdAt: Date;
  updatedAt: Date;
  address?: {
    street?: string;
    city: string;
    barangay: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Rescuer Mission - NOT a user, mission-based access
 * Generated for emergency responders with time/scope limits
 */
export interface RescuerMission {
  id: string;
  sosId: string;
  municipalityCode: string;

  token: string; // JWT with limited scope
  expiresAt: Date;

  permissions: RescuerPermission[];

  createdByUserId: string;
  createdByRole: UserRole;
  createdAt: Date;

  revokedAt?: Date;
}

export type RescuerPermission =
  | 'view_sos'
  | 'update_status'
  | 'send_location'
  | 'send_message';

/**
 * Audit Log - Legal-grade action tracking
 * Every admin action is logged for compliance and investigation
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;

  // Who did it
  actorUserId: string;
  actorRole: UserRole;

  // What they did (action context)
  action: AuditAction;
  municipalityCode?: string;
  targetUserId?: string;
  targetRole?: UserRole;
  metadata?: Record<string, unknown>;
}

export type AuditAction =
  | 'create_city_admin'
  | 'create_sos_admin'
  | 'suspend_user'
  | 'activate_user'
  | 'archive_user'
  | 'create_rescuer_mission'
  | 'revoke_rescuer_mission'
  | 'view_users'
  | 'view_audit_logs';

/**
 * Request User (Express middleware enrichment)
 * Added to request object for authorization checks
 */
export interface RequestUser {
  userId: string;
  firebaseUid: string;
  role: UserRole;
  municipalityCode?: string;
}

/**
 * API Response Format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: Date;
}

/**
 * Authority Rules - Non-Negotiable Enforcement
 * Dictates who can create/manage whom
 */
export const AUTHORITY_RULES: Record<UserRole, Readonly<UserRole[]>> = {
  APP_ADMIN: ['CITY_ADMIN', 'SOS_ADMIN'],
  CITY_ADMIN: ['SOS_ADMIN'],
  SOS_ADMIN: [],
  CITIZEN: [],
  RESCUER: []
};

/**
 * All Available Permissions - Single source of truth
 */
export const ALL_PERMISSIONS = [
  'manage_cities',
  'manage_admins',
  'view_all_sos',
  'assign_rescuer',
  'respond_to_sos',
  'create_sos',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

/**
 * Permission Matrix - Feature access by role
 * Every role must have every permission explicitly defined
 */
export const PERMISSION_MATRIX: Record<UserRole, Record<Permission, boolean>> = {
  APP_ADMIN: {
    manage_cities: true,
    manage_admins: true,
    view_all_sos: true,
    assign_rescuer: false,
    respond_to_sos: false,
    create_sos: false,
  },
  CITY_ADMIN: {
    manage_cities: false,
    manage_admins: true,
    view_all_sos: true,
    assign_rescuer: true,
    respond_to_sos: false,
    create_sos: false,
  },
  SOS_ADMIN: {
    manage_cities: false,
    manage_admins: false,
    view_all_sos: true,
    assign_rescuer: true,
    respond_to_sos: false,
    create_sos: false,
  },
  CITIZEN: {
    manage_cities: false,
    manage_admins: false,
    view_all_sos: false,
    assign_rescuer: false,
    respond_to_sos: false,
    create_sos: true,
  },
  RESCUER: {
    manage_cities: false,
    manage_admins: false,
    view_all_sos: false,
    assign_rescuer: false,
    respond_to_sos: true,
    create_sos: false,
  }
};
