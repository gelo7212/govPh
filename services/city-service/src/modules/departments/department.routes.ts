import { Router } from 'express';
import { departmentController } from './index';

const router = Router();

/**
 * Department Routes
 * Departmental responsibilities and capability routing
 */

/**
 * GET /departments
 * List all departments with optional filtering
 */
router.get(
  '/',
  (req, res, next) =>
    departmentController.getAll(req, res).catch(next),
);

/**
 * GET /departments/:id
 * Get department details by ID
 */
router.get(
  '/:id',
  (req, res, next) =>
    departmentController.getById(req, res).catch(next),
);

/**
 * POST /departments
 * Create a new department
 */
router.post(
  '/',
  (req, res, next) =>
    departmentController.create(req, res).catch(next),
);

/**
 * PUT /departments/:id
 * Update department information
 */
router.put(
  '/:id',
  (req, res, next) =>
    departmentController.update(req, res).catch(next),
);

/**
 * DELETE /departments/:id
 * Delete a department
 */
router.delete(
  '/:id',
  (req, res, next) =>
    departmentController.delete(req, res).catch(next),
);

export default router;