/**
 * Auth Service (Module Level)
 * Handles JWT token generation, validation, and revocation
 * 
 * Token Design Principle:
 * "Who is this request acting as, RIGHT NOW?"
 * 
 * Identity (optional) | Actor (required) | Mission (optional)
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JwtPayload, TokenResponse, TokenValidationResult, UserRole, ActorType, IdentityClaims, ActorContext, MissionContext } from '../../types';
import { authConfig } from '../../config/auth';
import { RevokedTokenModel } from './auth.mongo.schema';
import { createLogger } from '../../utils/logger';
import mongoose from 'mongoose';

const logger = createLogger('AuthService');

export class AuthService {
  /**
   * Generate Access Token
   * Short-lived token for API access
   */
  static generateAccessToken(payload: Omit<JwtPayload, 'iss' | 'aud' | 'exp' | 'iat'>, expiresIn?: number): string {
    try {
      const now = Math.floor(Date.now() / 1000);
      expiresIn = expiresIn ?? authConfig.jwt.accessTokenExpiry;

      const fullPayload: JwtPayload = {
        iss: authConfig.jwt.issuer,
        aud: authConfig.jwt.audience,
        iat: now,
        exp: now + expiresIn,
        ...payload,
      };

      const token = jwt.sign(fullPayload, authConfig.getAccessTokenSecret(), {
        algorithm: 'RS256',
        noTimestamp: true, // We set iat explicitly
      });

      const userId = payload.identity?.userId || 'anonymous';
      logger.info(`Generated access token for user ${userId} as ${payload.actor.type}`);
      return token;
    } catch (error) {
      logger.error('Failed to generate access token', error);
      throw error;
    }
  }

  /**
   * Generate Refresh Token
   * Long-lived token for obtaining new access tokens
   */
  static generateRefreshToken(payload: Omit<JwtPayload, 'iss' | 'aud' | 'exp' | 'iat'>): string {
    try {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = authConfig.jwt.refreshTokenExpiry;

      const fullPayload: JwtPayload = {
        iss: authConfig.jwt.issuer,
        aud: authConfig.jwt.audience,
        iat: now,
        exp: now + expiresIn,
        ...payload,
      };

      const token = jwt.sign(fullPayload, authConfig.getRefreshTokenSecret(), {
        algorithm: 'RS256',
        noTimestamp: true,
      });

      const userId = payload.identity?.userId || 'anonymous';
      logger.info(`Generated refresh token for user ${userId}`);
      return token;
    } catch (error) {
      logger.error('Failed to generate refresh token', error);
      throw error;
    }
  }

  /**
   * Generate Authenticated User Token Pair
   * For users who have logged in (have identity)
   * 
   * Scope Requirements:
   * - CITIZEN: scopes OPTIONAL (can be empty)
   * - RESCUER, APP_ADMIN, CITY_ADMIN, SOS_ADMIN: scopes REQUIRED
   * 
   * Returns both access and refresh tokens
   */
  static generateAuthenticatedUserTokens(
    userId: string,
    firebaseUid: string,
    userRole: UserRole,
    cityCode: string,
    scopes: string[],
    options?: {
      sosId?: string;
    }
  ): TokenResponse {
    const basePayload: Omit<JwtPayload, 'iss' | 'aud' | 'exp' | 'iat'> = {
      identity: {
        userId,
        firebaseUid,
        role: userRole,
        scopes,
      },
      actor: {
        type: 'USER',
        cityCode,
      },
      mission: options?.sosId ? { sosId: options.sosId } : undefined,
      tokenType: 'access',
    };

    const accessToken = this.generateAccessToken(basePayload);
    const refreshToken = this.generateRefreshToken(basePayload);

    return {
      accessToken,
      refreshToken,
      expiresIn: authConfig.jwt.accessTokenExpiry,
      tokenType: 'Bearer',
    };
  }

  /**
   * Generate Anonymous Citizen Token
   * For anonymous users reporting SOS
   * 
   * No identity block (anonymous)
   * Actor type: ANON
   * Scopes optional and placed in mission context if SOS present
   */
  static generateAnonCitizenToken(
    cityCode: string,
    scopes?: string[],
    options?: {
      sosId?: string;
    }
  ): TokenResponse {
    const basePayload: Omit<JwtPayload, 'iss' | 'aud' | 'exp' | 'iat'> = {
      // No identity block (anonymous)
      identity:{
        role: 'CITIZEN',
      },
      actor: {
        type: 'ANON',
        cityCode,
      },
      mission: options?.sosId ? { sosId: options.sosId, scopes } : undefined,
      tokenType: 'access',
    };

    const accessToken = this.generateAccessToken(basePayload, authConfig.jwt.anonCitizenAccessTokenExpiry);
    return {
      accessToken,
      refreshToken: '', // No refresh token for anonymous citizen
      expiresIn: authConfig.jwt.anonCitizenAccessTokenExpiry,
      tokenType: 'Bearer',
    };
  }

  static generateShareLinkToken(
    incidentId: string,
    cityCode: string,
    expiresIn?: number,
    assignmentId?: string,
    departmentId?: string,
    contextUsage?: 'REPORT_ASSIGNMENT' | 'REPORT_ASSIGNMENT_DEPARTMENT',
  ): string {
    const now = Math.floor(Date.now() / 1000);
    expiresIn = expiresIn ?? authConfig.jwt.shareLinkTokenExpiry;
    const payload: JwtPayload = {
      iss: authConfig.jwt.issuer,
      aud: authConfig.jwt.audience,
      iat: now,
      exp: now + expiresIn,
      identity:{
        role:'CITY_ADMIN',
      },
      actor: {
        type: 'SHARE_LINK',
        cityCode,
      },
      assignment: {
        incidentId,
        assignmentId,
        departmentId,
        contextUsage,
      },
      tokenType: 'share_link',
    };
    const token = jwt.sign(payload, authConfig.getAccessTokenSecret(), {
      algorithm: 'RS256',
      noTimestamp: true,
    });
    logger.info(`Generated share link token for incident ${incidentId}`);
    return token;
  }

  /**
   * Generate Anonymous Rescuer Token (Mission-Based)
   * For walk-in / volunteer rescuers (no pre-existing identity)
   * 
   * No identity block
   * Actor type: ANON
   * Mission context required (SOS + RescuerMissionId)
   * Scopes in mission context (REQUIRED for rescuers)
   */
  static generateAnonRescuerToken(
    sosId: string,
    rescuerMissionId: string | undefined,
    scopes: string[],
    cityCode?: string,
  ): string {
    const uuid = crypto.randomUUID();
    const basePayload: Omit<JwtPayload, 'iss' | 'aud' | 'exp' | 'iat'> = {
      identity: {
        role: 'RESCUER',
        userId: new mongoose.Types.ObjectId().toString(), // Random userId for tracking
      },
      actor: {
        type: 'ANON',
        cityCode : cityCode || 'UNKNOWN',
      },
      mission: {
        sosId,
        rescuerMissionId,
        scopes,
      },
      tokenType: 'access',
    };

    return this.generateAccessToken(basePayload, authConfig.jwt.anonRescuerAccessTokenExpiry);
  }

  /**
   * Deprecated: Legacy method for backward compatibility
   * Use generateAuthenticatedUserTokens() or generateAnonCitizenToken() instead
   */
  static generateTokenPair(
    userId: string,
    firebaseUid: string,
    userRole: UserRole,
    cityCode: string,
    scopes: string[],
    options?: {
      sosId?: string;
      rescuerId?: string;
    }
  ): TokenResponse {
    // Routes to new method
    return this.generateAuthenticatedUserTokens(userId, firebaseUid, userRole, cityCode, scopes, {
      sosId: options?.sosId,
    });
  }

  /**
   * Validate Access Token
   * Checks signature, expiration, and revocation status
   */
  static async validateAccessToken(token: string): Promise<TokenValidationResult> {
    try {
      // First check if token is revoked
      if (authConfig.revocation.enabled) {
        const isRevoked = await this.isTokenRevoked(token);
        if (isRevoked) {
          return {
            valid: false,
            error: 'Token has been revoked',
          };
        }
      }

      // Verify and decode token
      const payload = jwt.verify(token, authConfig.getAccessTokenPublicKey(), {
        algorithms: ['RS256'],
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
      }) as JwtPayload;

      const userId = payload.identity?.userId || 'anonymous';
      const actorType = payload.actor.type;
      logger.info(`Validated access token for ${actorType}: ${userId}`);
      return {
        valid: true,
        payload,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(`Access token validation failed: ${errorMessage}`);
      return {
        valid: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Validate Refresh Token
   * Checks signature, expiration, and revocation status
   */
  static async validateRefreshToken(token: string): Promise<TokenValidationResult> {
    try {
      // Check if token is revoked
      if (authConfig.revocation.enabled) {
        const isRevoked = await this.isTokenRevoked(token);
        if (isRevoked) {
          return {
            valid: false,
            error: 'Token has been revoked',
          };
        }
      }

      // Verify and decode token
      const payload = jwt.verify(token, authConfig.getRefreshTokenPublicKey(), {
        algorithms: ['RS256'],
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
      }) as JwtPayload;

      const userId = payload.identity?.userId || 'anonymous';
      logger.info(`Validated refresh token for user ${userId}`);
      
      return {
        valid: true,
        payload,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(`Refresh token validation failed: ${errorMessage}`);
      return {
        valid: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Revoke Token
   * Adds token to revocation blacklist
   * Handles duplicate key errors gracefully (token already revoked)
   */
  static async revokeToken(token: string): Promise<void> {
    try {
      // Decode to get expiration without verifying signature
      const decoded = jwt.decode(token) as JwtPayload | null;
      if (!decoded?.exp) {
        throw new Error('Cannot extract expiration from token');
      }

      const userId = decoded.identity?.userId || 'anonymous';
      const tokenHash = this.hashToken(token);
      const expiresAt = new Date(decoded.exp * 1000);

      await RevokedTokenModel.create({
        tokenHash,
        userId,
        revokedAt: new Date(),
        expiresAt,
      });

      logger.info(`Revoked token for user ${userId}`);
    } catch (error) {
      // Handle MongoDB duplicate key error (E11000) gracefully
      // This occurs when the token is already revoked, which is not an error
      if (error instanceof Error && error.message.includes('E11000')) {
        logger.debug('Token already revoked - skipping revocation');
        return;
      }
      
      // For other errors, log but don't fail the request
      // This ensures token refresh continues even if revocation fails
      logger.warn(`Token revocation failed (non-critical): ${error instanceof Error ? error.message : String(error)}`);
      // Don't re-throw - let the refresh continue
    }
  }

  /**
   * Revoke All User Tokens
   * Revokes all tokens for a specific user (logout)
   */
  static async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      logger.info(`Revoking all tokens for user ${userId}`);
      // Note: In a production system, you might want to:
      // 1. Maintain a token family/session ID
      // 2. Invalidate at the session level rather than token-by-token
      // For now, this is a placeholder for app-level logout handling
    } catch (error) {
      logger.error('Failed to revoke all user tokens', error);
      throw error;
    }
  }

  /**
   * Check if Token is Revoked
   * Returns true if token is in revocation blacklist
   */
  private static async isTokenRevoked(token: string): Promise<boolean> {
    try {
      const tokenHash = this.hashToken(token);
      const revokedEntry = await RevokedTokenModel.findOne({ tokenHash });
      return !!revokedEntry;
    } catch (error) {
      logger.error('Error checking token revocation', error);
      // On error, assume not revoked to avoid blocking legitimate requests
      return false;
    }
  }

  /**
   * Hash Token
   * Creates SHA256 hash of token for safe storage
   */
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Decode Token Without Verification
   * Use only for extracting claims from unverified tokens
   * (e.g., when refresh token might be expired but you still need the user ID)
   */
  static decodeTokenUnsafe(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload | null;
    } catch (error) {
      logger.warn('Failed to decode token (unsafe)', error);
      return null;
    }
  }
}
