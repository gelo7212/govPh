import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Missing authentication token');
  }

  // Token validation would happen here
  // For now, just pass through
  next();
};
