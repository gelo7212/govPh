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
    let userId = decoded.identity.userId;
    if(decoded.actor?.type === 'ANON'){
      if(decoded.identity.role === 'CITIZEN'){
        userId = 'Citizen-Anon';
      }
      else if(decoded.identity.role === 'RESCUER'){
        if(decoded.mission?.sosId){
          userId = `Rescuer-Anon-${decoded.mission.sosId}`;
        }else{
          throw new Error('AUTHENTICATION_ERROR: Missing sosId for ANON RESCUER');
        }
      }
    }
    (socket as any).userId = userId;
    (socket as any).sosId = decoded.mission?.sosId;
    (socket as any).role = decoded.identity.role;
    (socket as any).cityCode = decoded.actor.cityCode;

    logger.info('Socket authenticated', {
      socketId: socket.id,
      userId: userId,
    });

    next();
  } catch (error) {
    logger.error('Socket auth middleware error', error);
    next(new Error('AUTHENTICATION_ERROR: Token validation failed'));
  }
};

export default socketAuthMiddleware;
