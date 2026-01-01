/**
 * Auth Controller
 * Handles authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { JwtPayload, ApiResponse, PERMISSION_MATRIX } from '../../types';
import { createLogger } from '../../utils/logger';
import { userService } from '../user/user.service';

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
      const { userId, firebaseUid, sosId, rescuerId ,requestMissionId , contextType, cityCode } = req.body;

      let scopes: string[] = [];

      if (contextType === 'ANON_CITIZEN') {
        const token = AuthService.generateAnonCitizenToken(
          cityCode  , scopes,{
            sosId: sosId,
          }
        );

        res.status(200).json(
          {
            success: true,
            data: token,
            timestamp: new Date(),
          } as ApiResponse
        );
        return;
      }
      
      if(contextType === 'ANON_RESCUER'){
        if(sosId){
          scopes.push('respond_to_sos');
          
          const token = AuthService.generateAnonRescuerToken(
            sosId,
            requestMissionId,
            scopes,
            cityCode,
          );

          res.status(200).json(
            {
              success: true,
              data: token,
              timestamp: new Date(),
            } as ApiResponse
          );

          logger.info(`Generated anon rescuer token for SOS ${sosId}`);
          scopes = [];
          return;
        }
      }

      
      const user = await userService.getUserByFirebaseUid(firebaseUid);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      if(user.id?.toString() !== userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'User ID invalid for the provided Firebase UID',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }
      // admin login
      if(user.role === 'APP_ADMIN') {
        PERMISSION_MATRIX['APP_ADMIN'] && Object.entries(PERMISSION_MATRIX['APP_ADMIN']).forEach(([permission, hasAccess]) => {
          if(hasAccess) {
            scopes.push(permission);
          }
        });
      }

      if(user.role === 'CITY_ADMIN') {
        PERMISSION_MATRIX['CITY_ADMIN'] && Object.entries(PERMISSION_MATRIX['CITY_ADMIN']).forEach(([permission, hasAccess]) => {
          if(hasAccess) {
            scopes.push(permission);
          }
        });
      }
      if(user.role === 'SOS_ADMIN') {
        PERMISSION_MATRIX['SOS_ADMIN'] && Object.entries(PERMISSION_MATRIX['SOS_ADMIN']).forEach(([permission, hasAccess]) => {
          if(hasAccess) {
            scopes.push(permission);
          }
        });
      }

      // error when user has no municipality code  when not app admin.
      if(!user.municipalityCode &&  user.role !== 'APP_ADMIN') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_USER',
            message: 'User does not have a municipality code assigned',
          },
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }
      
      const tokens = AuthService.generateTokenPair(userId, firebaseUid, user.role, user.municipalityCode || '', scopes, {
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

      const userId = result.payload?.identity?.userId || 'anonymous';
      logger.info(`Validated token for user ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   * Exchange refresh token for new tokens with rotation
   * 
   * Implements refresh token rotation for security:
   * - Old refresh token is revoked after successful validation
   * - New refresh token is issued with new access token
   * - Prevents token hijacking by limiting exposure window
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken, sosId } = req.body;

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

      if (sosId && payload.mission) {
        payload.mission.sosId = sosId;
      }

      // Generate new tokens
      const newAccessToken = AuthService.generateAccessToken({
        identity: payload.identity,
        actor: payload.actor,
        mission: payload.mission,
        tokenType: 'access',
      });

      const newRefreshToken = AuthService.generateRefreshToken({
        identity: payload.identity,
        actor: payload.actor,
        mission: payload.mission,
        tokenType: 'refresh',
      });

      // Revoke old refresh token to prevent reuse (token rotation security)
      try {
        await AuthService.revokeToken(refreshToken);
      } catch (revokeError) {
        // Log but don't fail - tokens should still be issued
        logger.warn(`Failed to revoke old refresh token: ${revokeError instanceof Error ? revokeError.message : 'Unknown error'}`);
      }

      res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 15 * 60,
          tokenType: 'Bearer',
        },
        timestamp: new Date(),
      } as ApiResponse);

      logger.info(`Refreshed token pair for user ${payload.identity?.userId || 'anonymous'} with token rotation`);
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
      if (!decoded) {
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

      await AuthService.revokeToken(token);

      res.status(200).json({
        success: true,
        data: { message: 'Token revoked successfully' },
        timestamp: new Date(),
      } as ApiResponse);

      const userId = decoded.identity?.userId || 'anonymous';
      logger.info(`Revoked token for user ${userId}`);
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
