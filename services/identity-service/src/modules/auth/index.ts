/**
 * Auth Module Exports
 */

export { AuthService } from './auth.service';
export { AuthController } from './auth.controller';
export { authMiddleware, optionalAuthMiddleware, requireScopes, requireContextTypes } from '../../middlewares/auth';
export { authConfig } from '../../config/auth';
export type { JwtPayload, TokenResponse, TokenValidationResult, ContextType } from '../../types';

// Default route export
export { default as authRoutes } from './auth.routes';
