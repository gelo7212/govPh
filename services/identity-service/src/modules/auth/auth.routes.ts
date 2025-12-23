/**
 * Auth Routes
 * Endpoints for token generation, validation, and revocation
 */

import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

/**
 * POST /auth/token
 * Generate access and refresh tokens
 */
router.post('/token', AuthController.generateToken);

/**
 * POST /auth/validate
 * Validate access token
 */
router.post('/validate', AuthController.validateToken);

/**
 * POST /auth/refresh
 * Exchange refresh token for new access token
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * POST /auth/revoke
 * Revoke an access token (logout)
 */
router.post('/revoke', AuthController.revokeToken);

/**
 * POST /auth/revoke-all
 * Revoke all tokens for current user (logout from all devices)
 * Requires authentication
 */
router.post('/revoke-all', AuthController.revokeAllTokens);

export default router;
