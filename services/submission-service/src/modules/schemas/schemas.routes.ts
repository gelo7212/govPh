import { Router } from 'express';
import Joi from 'joi';
import { SchemasController } from './schemas.controller';
import { validateRequest } from '../../middlewares/schema.validator.middleware';

const router = Router();
const schemasController = new SchemasController();

// Validation schemas
const createSchemaSchema = Joi.object({
  formKey: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  fields: Joi.array().items(Joi.object()).default([]),
});

const updateSchemaSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  fields: Joi.array().items(Joi.object()).optional(),
  formKey: Joi.string().optional(),
});

/**
 * GET /api/schemas - List all form schemas
 */
router.get('/', (req, res, next) =>
  schemasController.getAllSchemas(req, res, next)
);

/**
 * GET /api/schemas/:id - Get specific schema
 */
router.get('/:id', (req, res, next) =>
  schemasController.getSchemaById(req, res, next)
);

/**
 * POST /api/schemas - Create new schema
 */
router.post('/', validateRequest(createSchemaSchema), (req, res, next) =>
  schemasController.createSchema(req, res, next)
);

/**
 * PUT /api/schemas/:id - Update schema
 */
router.put('/:id', validateRequest(updateSchemaSchema), (req, res, next) =>
  schemasController.updateSchema(req, res, next)
);

/**
 * DELETE /api/schemas/:id - Delete schema
 */
router.delete('/:id', (req, res, next) =>
  schemasController.deleteSchema(req, res, next)
);

/**
 * POST /api/schemas/:id/publish - Publish schema
 */
router.post('/:id/publish', (req, res, next) =>
  schemasController.publishSchema(req, res, next)
);

export default router;