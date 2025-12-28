import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import { JWTToken } from '../types/token.types';

/**
 * Token Service - Verifies and decodes JWT tokens
 */
export class TokenService {

  /**
   * Verify and decode token using RS256 algorithm
   */
  static verifyToken(token: string): any {
    try {
      if (!config.JWT_PUBLIC_KEY) {
        logger.error('JWT_PUBLIC_KEY not configured');
        return null;
      }

      const decoded = jwt.verify(token, config.JWT_PUBLIC_KEY, {
        algorithms: ['RS256'],
      }) as JWTToken;


      // for non-anonymous tokens, ensure identity and actor are present
      if (!decoded.identity || !decoded.actor) {
        logger.warn('Invalid token structure', { token: token.substring(0, 20) });
        return null;
      }

      return decoded;
    } catch (error) {
      logger.error('Token verification failed', error instanceof Error ? error.message : error);
      return null;
    }
  }

}

export default TokenService;
