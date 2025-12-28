import { Socket } from 'socket.io';
import { TokenService } from '../services/token.service';
import { logger } from '../utils/logger';
import { JWTToken } from '../types/token.types';

/**
 * Middleware for validating Socket.IO connections
 * Authenticates based on JWT token passed during handshake
 */
export const socketAuthMiddleware = (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      logger.warn('Socket connection attempted without token', {
        socketId: socket.id,
        ip: socket.handshake.address,
      });
      return next(new Error('AUTHENTICATION_ERROR: Missing token'));
    }

    // Verify and decode token
    const decoded = TokenService.verifyToken(token) as JWTToken;

    if (!decoded) {
      logger.warn('Invalid socket token', {
        socketId: socket.id,
      });
      return next(new Error('AUTHENTICATION_ERROR: Invalid token'));
    }

    // Attach user data to socket
    (socket as any).userId = decoded.identity.userId;
    (socket as any).sosId = decoded.mission?.sosId;
    (socket as any).role = decoded.identity.role;
    (socket as any).cityCode = decoded.actor.cityCode;

    logger.info('Socket authenticated', {
      socketId: socket.id,
      userId: decoded.identity.userId,
    });

    next();
  } catch (error) {
    logger.error('Socket auth middleware error', error);
    next(new Error('AUTHENTICATION_ERROR: Token validation failed'));
  }
};

export default socketAuthMiddleware;
