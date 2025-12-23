/**
 * Auth Controller
 * Handles authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { JwtPayload, ApiResponse } from '../../types';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AuthController');

export class AuthController {
  /**
   * POST /auth/token
   * Generate access and refresh tokens
   */
  static async generateToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, firebaseUid, contextType, cityCode, scopes, sosId, rescuerId } = req.body;

      // Validate required fields
      if (!userId || !firebaseUid || !contextType || !cityCode || !scopes) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: userId, firebaseUid, contextType, cityCode, scopes',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      const tokens = AuthService.generateTokenPair(userId, firebaseUid, contextType, cityCode, scopes, {
        sosId,
        rescuerId,
      });

      res.status(200).json(
        {
          success: true,
          data: tokens,
          timestamp: new Date(),
        } as ApiResponse
      );

      logger.info(`Generated token pair for user ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/validate
   * Validate access token
   */
  static async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Token is required',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      const result = await AuthService.validateAccessToken(token);

      if (!result.valid) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: result.error || 'Token validation failed',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          valid: true,
          payload: result.payload,
        },
        timestamp: new Date(),
      } as ApiResponse);

      logger.info(`Validated token for user ${result.payload?.userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   * Exchange refresh token for new access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Refresh token is required',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      const validation = await AuthService.validateRefreshToken(refreshToken);

      if (!validation.valid || !validation.payload) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: validation.error || 'Refresh token validation failed',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      const payload = validation.payload;
      const newAccessToken = AuthService.generateAccessToken({
        contextType: payload.contextType,
        userId: payload.userId,
        firebaseUid: payload.firebaseUid,
        cityCode: payload.cityCode,
        scopes: payload.scopes,
        sosId: payload.sosId,
        rescuerId: payload.rescuerId,
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn: 15 * 60,
          tokenType: 'Bearer',
        },
        timestamp: new Date(),
      } as ApiResponse);

      logger.info(`Refreshed access token for user ${payload.userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/revoke
   * Revoke an access token (logout)
   */
  static async revokeToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Token is required',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      const decoded = AuthService.decodeTokenUnsafe(token) as JwtPayload | null;
      if (!decoded?.userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Unable to extract user information from token',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      await AuthService.revokeToken(token, decoded.userId);

      res.status(200).json({
        success: true,
        data: { message: 'Token revoked successfully' },
        timestamp: new Date(),
      } as ApiResponse);

      logger.info(`Revoked token for user ${decoded.userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/revoke-all
   * Revoke all tokens for current user (logout from all devices)
   */
  static async revokeAllTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      await AuthService.revokeAllUserTokens(req.user.userId);

      res.status(200).json({
        success: true,
        data: { message: 'All tokens revoked successfully' },
        timestamp: new Date(),
      } as ApiResponse);

      logger.info(`Revoked all tokens for user ${req.user.userId}`);
    } catch (error) {
      next(error);
    }
  }
}
