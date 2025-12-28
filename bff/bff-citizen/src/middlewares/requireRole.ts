import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user has required roles
 */
export function requireRoleMiddleware(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.context?.user;

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const hasRole = requiredRoles.includes(user.role || '');

    if (!hasRole) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}
