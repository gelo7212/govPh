import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to check if user has required role
 * @param roles - One or more roles that are allowed to access the endpoint
 * @returns Middleware function
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).context?.user?.role;

    if (!userRole) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
      return;
    }

    if (!roles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `This endpoint requires one of the following roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
}