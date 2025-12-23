import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestContext } from '../types/context';

/**
 * Middleware to extract and attach authentication context to request
 */
export function authContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = uuidv4();
  
  // Extract user from JWT token or session
  const authHeader = req.headers.authorization;
  let user = undefined;

  if (authHeader) {
    try {
      // TODO: Parse JWT token and extract user info
      // For now, just extract from header
      const token = authHeader.replace('Bearer ', '');
      // Decode logic would go here
    } catch (error) {
      console.error('Failed to parse auth token', error);
    }
  }

  req.context = {
    user,
    requestId,
    timestamp: new Date(),
  } as RequestContext;

  next();
}
