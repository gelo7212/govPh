import { Router } from 'express';
import { adminController } from './admin.controller';
import { requireCityAdmin, requireAppAdmin } from '../../middlewares/requireRole';

const router = Router();

/**
 * Admin Routes
 * Administrative user management endpoints
 * Strictly enforces role-based access and municipality scoping
 */

/**
 * POST /admin/users
 * Create a new admin user (city_admin or sos_admin)
 * Allowed: app_admin, city_admin
 */
router.post(
  '/users',
  requireCityAdmin(),
  (req, res, next) =>
    adminController.createAdmin(req, res).catch(next)
);

/**
 * GET /admin/users
 * List users in scoped municipality
 * Allowed: app_admin, city_admin, sos_admin
 */
router.get(
  '/users',
  requireCityAdmin(),
  (req, res, next) =>
    adminController.listUsers(req, res).catch(next)
);

/**
 * GET /admin/audit-logs
 * Retrieve audit logs
 * Allowed: app_admin (all), city_admin/sos_admin (their municipality)
 */
router.get(
  '/audit-logs',
  requireCityAdmin(),
  (req, res, next) =>
    adminController.getAuditLogs(req, res).catch(next)
);

export default router;
