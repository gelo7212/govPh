import { Request, Response, NextFunction } from 'express';
import { UserRole, RequestUser } from '../types';
import { InsufficientPermissionError } from '../errors';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

/**
 * Role Guard Middleware - Enforces role-based access control
 * Simple and non-negotiable authorization layer
 *
 * Usage:
 *   router.post('/admin/users', requireRole(['app_admin']), createAdmin);
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new Error('UNAUTHENTICATED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new InsufficientPermissionError(
        allowedRoles.join(', '),
        req.user.role
      );
    }

    next();
  };
}

/**
 * Municipality Scope Guard - Ensures users cannot exceed their municipality scope
 * CRITICAL for LGU data isolation
 *
 * Usage:
 *   router.get('/admin/users/:municipalityCode', requireMunicipalityScope(), getUsers);
 */
export function requireMunicipalityScope() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new Error('UNAUTHENTICATED');
    }

    const targetMunicipality = req.params.municipalityCode || req.query.municipalityCode;

    // app_admin can access all municipalities
    if (req.user.role === 'APP_ADMIN') {
      next();
      return;
    }

    // city_admin and sos_admin must match their scoped municipality
    if (req.user.role === 'CITY_ADMIN' || req.user.role === 'SOS_ADMIN') {
      if (targetMunicipality && targetMunicipality !== req.user.municipalityCode) {
        throw new Error('MUNICIPALITY_ACCESS_DENIED');
      }
    }

    // citizens and rescuers: no admin access
    if (req.user.role === 'CITIZEN') {
      throw new InsufficientPermissionError('CITY_ADMIN', 'CITIZEN');
    }

    next();
  };
}

/**
 * App Admin Only - Strongest restriction
 */
export function requireAppAdmin() {
  return requireRole(['APP_ADMIN']);
}

/**
 * City Admin or higher
 */
export function requireCityAdmin() {
  return requireRole(['APP_ADMIN', 'CITY_ADMIN']);
}

/**
 * SOS Admin or higher
 */
export function requireSOSAdmin() {
  return requireRole(['APP_ADMIN', 'CITY_ADMIN', 'SOS_ADMIN']);
}

/**
 * Authenticated user (any role)
 */
export function requireAuth() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new Error('UNAUTHENTICATED');
    }
    next();
  };
}
