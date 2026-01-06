import { Router } from 'express';
import { InviteController } from './invite.controller';
import { InviteAggregator } from './invite.aggregator';
import { IdentityServiceClient } from '@gov-ph/bff-core';
import { authContextMiddleware } from '../../middlewares/authContext';
import { preventActor, requireActor } from '../../middlewares/requireActor';

export const inviteRoutes = Router();

// Initialize dependencies
const identityClient = new IdentityServiceClient(
  process.env.IDENTITY_SERVICE_URL || 'http://govph-identity:3000'
);
const inviteAggregator = new InviteAggregator(identityClient);
const inviteController = new InviteController(inviteAggregator);

/**
 * POST /invites
 * Create a new invite
 * Allowed: APP_ADMIN, CITY_ADMIN
 */
/**
 * GET /invites/:inviteId
 * Validate invite (check status)
 * Public endpoint - no auth required
 */
inviteRoutes.get(
  '/:inviteId',
  (req, res) => inviteController.validateInvite(req, res)
);


inviteRoutes.use(authContextMiddleware, preventActor('ANON'));
inviteRoutes.post(
  '/',
  authContextMiddleware,
  (req, res) => inviteController.createInvite(req, res)
);



/**
 * POST /invites/:inviteId/accept
 * Accept invite with 6-digit code
 * Requires authentication
 */
inviteRoutes.post(
  '/:inviteId/accept',
  authContextMiddleware,
  (req, res) => inviteController.acceptInvite(req, res)
);

/**
 * GET /invites
 * List invites (admin dashboard)
 * Allowed: APP_ADMIN, CITY_ADMIN
 */
inviteRoutes.get(
  '/',
  authContextMiddleware,
  (req, res) => inviteController.listInvites(req, res)
);
