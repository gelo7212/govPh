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
      userId: validation.payload.identity?.userId || '',
      firebaseUid: validation.payload.identity?.firebaseUid || '',
      role: validation.payload.identity?.role || 'CITIZEN',
      municipalityCode: validation.payload.actor.cityCode,
    };

    // Also attach full JWT payload for detailed access
    (req as any).jwtPayload = validation.payload;

    const userId = validation.payload.identity?.userId || 'anonymous';
    logger.info(`Authenticated user ${userId}`);
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
        userId: validation.payload.identity?.userId || '',
        firebaseUid: validation.payload.identity?.firebaseUid || '',
        role: validation.payload.identity?.role || 'CITIZEN',
        municipalityCode: validation.payload.actor.cityCode,
      };
      (req as any).jwtPayload = validation.payload;
      const userId = validation.payload.identity?.userId || 'anonymous';
      logger.info(`Authenticated user ${userId}`);
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
 * Checks if user has one of the required actor types
 */
export const requireActorTypes = (types: string[]) => {
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

    if (!types.includes(payload.actor.actorType)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Invalid actor type. Required: ${types.join(', ')}`,
        },
        timestamp: new Date(),
      } as ApiResponse);
    }

    return next();
  };
};


export const addAuthContextOptional = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const isValid =  await AuthService.validateAccessToken(token);
    if (isValid.valid && isValid.payload) {
      req.user = {
        userId: isValid.payload.identity?.userId || '',
        firebaseUid: isValid.payload.identity?.firebaseUid || '',
        role: isValid.payload.identity?.role || 'CITIZEN',
        municipalityCode: isValid.payload.actor.cityCode,
        isLoggedIn: true,
      };
      (req as any).jwtPayload = isValid.payload;
      const userId = isValid.payload.identity?.userId || 'anonymous';
      logger.info(`Authenticated user ${userId}`);
    }
  }
  next();
  return;
};