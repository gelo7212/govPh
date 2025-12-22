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
    if (req.user.role === 'app_admin') {
      next();
      return;
    }

    // city_admin and sos_admin must match their scoped municipality
    if (req.user.role === 'city_admin' || req.user.role === 'sos_admin') {
      if (targetMunicipality && targetMunicipality !== req.user.municipalityCode) {
        throw new Error('MUNICIPALITY_ACCESS_DENIED');
      }
    }

    // citizens and rescuers: no admin access
    if (req.user.role === 'citizen') {
      throw new InsufficientPermissionError('city_admin', 'citizen');
    }

    next();
  };
}

/**
 * App Admin Only - Strongest restriction
 */
export function requireAppAdmin() {
  return requireRole(['app_admin']);
}

/**
 * City Admin or higher
 */
export function requireCityAdmin() {
  return requireRole(['app_admin', 'city_admin']);
}

/**
 * SOS Admin or higher
 */
export function requireSOSAdmin() {
  return requireRole(['app_admin', 'city_admin', 'sos_admin']);
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
