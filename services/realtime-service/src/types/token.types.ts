/**
 * Central type definitions for realtime-service
 */

/**
 * JWT Token Identity Information
 */
export interface TokenIdentity {
  userId: string;
  firebaseUid: string;
  role: 'CITIZEN' | 'RESCUER' | 'DISPATCHER' | 'ADMIN';
}

/**
 * JWT Token Actor Information
 */
export interface TokenActor {
  type: 'USER' | 'SERVICE' | 'SYSTEM' | 'ANON';
  cityCode: string;
}
export interface MissionContext {
  sosId: string;                // Active SOS incident (REQUIRED if mission block present)
  rescuerMissionId?: string;    // RMT ID (NOT rescuer identity, mission-scoped)
  scopes?: string[];            // Resolved permissions for mission context (OPTIONAL)
}
/**
 * JWT Token Payload Structure
 */
export interface JWTToken {
  iss: string;
  aud: string;
  exp: number;
  identity: TokenIdentity;
  actor: TokenActor;
  mission?: MissionContext;
  iat?: number;
  nbf?: number;
}

/**
 * Decoded JWT token with standard claims
 */
export interface DecodedToken extends JWTToken {
  iat: number;
}

export * from './socket.types';
