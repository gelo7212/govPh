/**
 * Auth Middleware
 * Validates JWT tokens and enriches requests with user context
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../types';
import { createLogger } from '../utils/logger';

const logger = createLogger('AuthMiddleware');

/**
 * Middleware to validate JWT token from Authorization header
 * Extracts and verifies token, adds payload to req.user
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authorization header missing or invalid format (expected "Bearer <token>")',
        },
        timestamp: new Date(),
      } as ApiResponse);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Validate token
    const validation = await AuthService.validateAccessToken(token);

    if (!validation.valid || !validation.payload) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: validation.error || 'Token validation failed',
        },
        timestamp: new Date(),
      } as ApiResponse);
    }

    // Attach payload to request
    req.user = {
      userId: validation.payload.userId,
      firebaseUid: validation.payload.firebaseUid,
      role: 'citizen', // Map contextType to role if needed
      municipalityCode: validation.payload.cityCode,
    };

    // Also attach full JWT payload for detailed access
    (req as any).jwtPayload = validation.payload;

    logger.info(`Authenticated user ${validation.payload.userId}`);
    return next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error',
      },
      timestamp: new Date(),
    } as ApiResponse);
  }
};

/**
 * Optional auth middleware
 * Validates token if present, but doesn't fail if missing
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const validation = await AuthService.validateAccessToken(token);

    if (validation.valid && validation.payload) {
      req.user = {
        userId: validation.payload.userId,
        firebaseUid: validation.payload.firebaseUid,
        role: 'citizen',
        municipalityCode: validation.payload.cityCode,
      };
      (req as any).jwtPayload = validation.payload;
      logger.info(`Authenticated user ${validation.payload.userId}`);
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error', error);
    next(); // Don't fail on error for optional auth
  }
};

/**
 * Scope validator middleware
 * Checks if user has required scopes
 */
export const requireScopes = (requiredScopes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const payload = (req as any).jwtPayload;

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
        timestamp: new Date(),
      } as ApiResponse);
    }

    const userScopes = payload.scopes || [];
    const hasRequiredScopes = requiredScopes.every((scope) =>
      userScopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Missing required scopes: ${requiredScopes.join(', ')}`,
        },
        timestamp: new Date(),
      } as ApiResponse);
    }
    return next();
  };
};

/**
 * Context type validator middleware
 * Checks if user has one of the required context types
 */
export const requireContextTypes = (types: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const payload = (req as any).jwtPayload;

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
        timestamp: new Date(),
      } as ApiResponse);
    }

    if (!types.includes(payload.contextType)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Invalid context type. Required: ${types.join(', ')}`,
        },
        timestamp: new Date(),
      } as ApiResponse);
    }

    return next();
  };
};
