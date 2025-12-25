import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from '../config/firebase';

/**
 * Middleware to extract and attach authentication context to request
 * Validates Firebase tokens from Authorization header
 */
export async function authContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = uuidv4();
  
  // Extract Firebase token from Authorization header
  const authHeader = req.headers.authorization;
  let user = undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '');
      // Validate Firebase token asynchronously
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token);
      user = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        roles: (decodedToken.roles as string[]) || [],
      };

      req.context = {
        user,
        requestId,
        timestamp: new Date(),
      };
      next();
      return;
    } catch (error) {
      console.error('Failed to parse auth token', error);
    }
  }

  req.context = {
    user,
    requestId,
    timestamp: new Date(),
  };

  next();
}
