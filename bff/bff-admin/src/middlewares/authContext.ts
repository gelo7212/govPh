import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

/**
 * Middleware to extract and attach authentication context to request
 * Validates JWT tokens from Authorization header using JWT_PUBLIC_KEY from env
 */
export async function authContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = uuidv4();
  
  // Extract JWT token from Authorization header
  const authHeader = req.headers.authorization;
  let user = undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const publicKey = process.env.JWT_PUBLIC_KEY;
      
      if (!publicKey) {
        throw new Error('JWT_PUBLIC_KEY environment variable is not set');
      }

      // Verify and decode JWT token using public key
      const decodedToken = jwt.verify(token, publicKey) as any;
      user = {
        id: decodedToken.identity?.userId || decodedToken.uid || decodedToken.sub,
        email: decodedToken.identity?.email || decodedToken.email,
        role: decodedToken.identity?.role,
        firebaseUid: decodedToken.identity?.firebaseUid,
        actor: decodedToken.actor,
        
      };

      const role = decodedToken.identity?.role;
      if(role !== 'SOS_ADMIN' && role !== 'RESCUER' && role !=='SK_YOUTH_ADMIN' && role !== 'APP_ADMIN' && role !== 'CITY_ADMIN'){
        res.status(403).json({ error: 'Forbidden: Insufficient role' });
        return;
      }
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
