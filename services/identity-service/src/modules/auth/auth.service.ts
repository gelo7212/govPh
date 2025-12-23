/**
 * Auth Service
 * Handles JWT token generation, validation, and revocation
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JwtPayload, TokenResponse, TokenValidationResult, ContextType } from '../../types';
import { authConfig } from '../../config/auth';
import { RevokedTokenModel } from './auth.mongo.schema';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AuthService');

export class AuthService {
  /**
   * Generate Access Token
   * Short-lived token for API access
   */
  static generateAccessToken(payload: Omit<JwtPayload, 'iss' | 'aud' | 'exp' | 'iat'>): string {
    try {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = authConfig.jwt.accessTokenExpiry;

      const fullPayload: JwtPayload = {
        iss: authConfig.jwt.issuer,
        aud: authConfig.jwt.audience,
        iat: now,
        exp: now + expiresIn,
        ...payload,
      };

      const token = jwt.sign(fullPayload, authConfig.getAccessTokenSecret(), {
        algorithm: 'HS256',
        noTimestamp: true, // We set iat explicitly
      });

      logger.info(`Generated access token for user ${payload.userId}`);
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
        algorithm: 'HS256',
        noTimestamp: true,
      });

      logger.info(`Generated refresh token for user ${payload.userId}`);
      return token;
    } catch (error) {
      logger.error('Failed to generate refresh token', error);
      throw error;
    }
  }

  /**
   * Generate Token Pair
   * Returns both access and refresh tokens
   */
  static generateTokenPair(
    userId: string,
    firebaseUid: string,
    contextType: ContextType,
    cityCode: string,
    scopes: string[],
    options?: {
      sosId?: string;
      rescuerId?: string;
    }
  ): TokenResponse {
    const basePayload: Omit<JwtPayload, 'iss' | 'aud' | 'exp' | 'iat'> = {
      contextType,
      userId,
      firebaseUid,
      cityCode,
      scopes,
      sosId: options?.sosId,
      rescuerId: options?.rescuerId,
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
      const payload = jwt.verify(token, authConfig.getAccessTokenSecret(), {
        algorithms: ['HS256'],
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
      }) as JwtPayload;

      logger.info(`Validated access token for user ${payload.userId}`);
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
      const payload = jwt.verify(token, authConfig.getRefreshTokenSecret(), {
        algorithms: ['HS256'],
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
      }) as JwtPayload;

      logger.info(`Validated refresh token for user ${payload.userId}`);
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
   */
  static async revokeToken(token: string, userId: string): Promise<void> {
    try {
      // Decode to get expiration without verifying signature
      const decoded = jwt.decode(token) as JwtPayload | null;
      if (!decoded?.exp) {
        throw new Error('Cannot extract expiration from token');
      }

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
      logger.error('Failed to revoke token', error);
      throw error;
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
