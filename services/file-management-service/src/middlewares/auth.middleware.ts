import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors';
import { User, RequestContext } from '../types';

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
if(!JWT_PUBLIC_KEY) {
  throw new Error('JWT_PUBLIC_KEY is not defined in environment variables');
}

export const validateAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Missing authorization token');
    }

    const decoded = jwt.verify(token, JWT_PUBLIC_KEY ) as any;
    
    const user: User = {
      id: decoded.identity?.userId || decoded.id || decoded.sub,
      userId: decoded.identity?.userId || decoded.id || decoded.sub,
      email: decoded.identity?.email || decoded.email,
      role: decoded.identity?.role || decoded.role,
      firebaseUid: decoded.identity?.firebaseUid,
      actor: decoded.actor,
    };

    req.context = {
      user,
      timestamp: new Date(),
      requestId: '',
    } as RequestContext;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
};
