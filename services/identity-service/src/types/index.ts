/**
 * User Role Types - Authoritative role definitions
 */
export type UserRole = 'app_admin' | 'city_admin' | 'sos_admin' | 'citizen';

/**
 * Context Type for JWT Token Claims
 */
export type ContextType = 'USER' | 'ADMIN' | 'ANON' | 'RESCUER';

/**
 * JWT Token Payload
 * Standard claims + custom application claims
 */
export interface JwtPayload {
  // Standard JWT claims
  iss: string; // Issuer: "identity.e-citizen"
  aud: string; // Audience: "e-citizen"
  exp: number; // Expiration time (Unix timestamp)
  iat?: number; // Issued at (Unix timestamp)

  // Custom claims
  contextType: ContextType;

  userId: string; // USER-123 format
  firebaseUid: string; // Firebase UID

  sosId?: string; // SOS incident ID (optional)
  rescuerId?: string; // Rescuer ID (optional, null for non-rescuer)

  cityCode: string; // Municipality code (CALUMPIT)

  scopes: string[]; // Permission scopes
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
  id: string;
  firebaseUid: string;

  role: UserRole;

  email?: string;
  phone?: string;
  displayName?: string;

  // LGU-specific: REQUIRED for city_admin & sos_admin
  municipalityCode?: string;
  department?: Department;

  registrationStatus: RegistrationStatus;

  createdAt: Date;
  updatedAt: Date;
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
  app_admin: ['city_admin', 'sos_admin'],
  city_admin: ['sos_admin'],
  sos_admin: [],
  citizen: [],
};

/**
 * Permission Matrix - Feature access by role
 */
export const PERMISSION_MATRIX: Record<
  UserRole,
  Record<string, boolean>
> = {
  app_admin: {
    manage_cities: true,
    manage_admins: true,
    view_all_sos: true,
    assign_rescuer: false,
    respond_to_sos: false,
    create_sos: false,
  },
  city_admin: {
    manage_cities: false,
    manage_admins: true, // SOS only
    view_all_sos: true,
    assign_rescuer: true,
    respond_to_sos: false,
    create_sos: false,
  },
  sos_admin: {
    manage_cities: false,
    manage_admins: false,
    view_all_sos: true,
    assign_rescuer: true,
    respond_to_sos: false,
    create_sos: false,
  },
  citizen: {
    manage_cities: false,
    manage_admins: false,
    view_all_sos: false,
    assign_rescuer: false,
    respond_to_sos: false,
    create_sos: true,
  },
};
