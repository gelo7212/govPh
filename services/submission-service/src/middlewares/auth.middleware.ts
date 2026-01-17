import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors';
import { decodeJWT } from '../utils/jwt';

export const authenticateToken = (
  roles: string[] = []
) => {
  return async ( 
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.headers['authorization'];
    let user = undefined;
    if(!authHeader) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = decodeJWT(token) as any;
    const role = decodedToken?.identity?.role;
    if(!roles.includes(role)){
      res.status(403).json({ error: 'Forbidden: Invalid role' });
      return;
    }
    console.log("Decoded Token:", decodedToken);

    user = {
      id: decodedToken.identity?.userId || decodedToken.uid || decodedToken.sub,
      userId: decodedToken.identity?.userId || decodedToken.uid || decodedToken.sub,
      email: decodedToken.identity?.email || decodedToken.email,
      role: decodedToken.identity?.role,
      firebaseUid: decodedToken.identity?.firebaseUid,
      actor: decodedToken.actor,
      
    };
    if (!token) {
      throw new UnauthorizedError('Missing authentication token');
    }
    req.context = {
      user,
      timestamp: new Date(),
      requestId: '', // You can set this to a generated request ID if needed
    };
    next();
    return;
  }
};
