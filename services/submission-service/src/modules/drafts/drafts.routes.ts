import { Router } from 'express';
import Joi from 'joi';
import { DraftsController } from './drafts.controller';
import { validateRequest } from '../../middlewares/schema.validator.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
const draftsController = new DraftsController();

// Validation schemas
const createDraftSchema = Joi.object({
  schemaId: Joi.string().required(),
  formKey: Joi.string().required(),
  data: Joi.object().required(),
});

const updateDraftSchema = Joi.object({
  data: Joi.object().required(),
});

const getAllDraftsSchema = Joi.object({
  schemaId: Joi.string().required(),
  skip  : Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(0).default(0),
});

const getDraftByIdSchema = Joi.object({
});

const deleteDraftSchema = Joi.object({
});


router.use(authenticateToken(['CITIZEN']));

/**
 * GET /api/drafts - List drafts
 */
router.get('/', validateRequest(getAllDraftsSchema), (req, res, next) =>
  draftsController.getAllDrafts(req, res, next)
);

/**
 * GET /api/drafts/:id - Get draft
 */
router.get('/:id', validateRequest(getDraftByIdSchema), (req, res, next) =>
  draftsController.getDraftById(req, res, next)
);

/**
 * POST /api/drafts - Save draft
 */
router.post('/', validateRequest(createDraftSchema), (req, res, next) =>
  draftsController.saveDraft(req, res, next)
);

/**
 * PUT /api/drafts/:id - Update draft
 */
router.put('/:id', validateRequest(updateDraftSchema), (req, res, next) =>
  draftsController.updateDraft(req, res, next)
);

/**
 * DELETE /api/drafts/:id - Delete draft
 */
router.delete('/:id', validateRequest(deleteDraftSchema), (req, res, next) =>
  draftsController.deleteDraft(req, res, next)
);

export default router;