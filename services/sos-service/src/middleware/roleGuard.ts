import { Request, Response, NextFunction } from 'express';

export enum UserRole {
  RESCUER = 'RESCUER',
  CITIZEN = 'CITIZEN',
  SOS_ADMIN = 'SOS_ADMIN',
  CITY_ADMIN = 'CITY_ADMIN',
  APP_ADMIN = 'APP_ADMIN',
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        cityId: string;
        requestId: string;
      };
      validatedBody?: any;
    }
  }
}

/**
 * Role Guard Middleware
 * Validates and attaches user role information to requests
 * Extracts trusted headers from Gateway/BFF
 */
export const roleGuard = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract trusted context from Gateway/BFF
    const userRole = req.headers['x-user-role'] as string | undefined;
    const userId = req.headers['x-user-id'] as string | undefined;
    const cityId = req.headers['x-city-id'] as string | undefined;
    const requestId = req.headers['x-request-id'] as string | undefined;
    const actorType = req.headers['x-actor-type'] as string | undefined;
    console.log('Role Guard - Extracted Headers:', {
      userRole,
      userId,
      cityId,
      requestId,
      actorType,
    });
    // Check if this is an anonymous actor (citizen or rescuer)
    const isAnonymousWithoutCity =
      actorType === 'ANON' &&
      (userRole === UserRole.CITIZEN || userRole === UserRole.RESCUER);

    // Validate required headers based on actor type
    // if (!isAnonymousWithoutCity && !cityId) {
    //   return res.status(400).json({ error: 'Missing city ID in headers' });
    // }

    if (!userRole || !userId) {
      console.warn('Missing required headers (userId, userRole) in request');
      // Optionally continue without user context for health checks
      if (req.path === '/health') {
        return next();
      }
      // Or require authentication
      // return res.status(401).json({ error: 'Missing required headers' });
    }

    if (userRole && userId) {
      // Validate role
      if (!Object.values(UserRole).includes(userRole as UserRole)) {
        return res.status(400).json({ error: 'Invalid user role' });
      }

      req.user = {
        id: userId,
        role: userRole as UserRole,
        cityId: cityId || '',
        requestId: requestId || `req_${Date.now()}`,
      };
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Role guard validation failed' });
  }
};

/**
 * Middleware to require specific roles
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
