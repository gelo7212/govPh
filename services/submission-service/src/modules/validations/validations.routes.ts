import { Router } from 'express';
import Joi from 'joi';
import { ValidationsController } from './validations.controller';
import { validateRequest } from '../../middlewares/schema.validator.middleware';

const router = Router();
const validationsController = new ValidationsController();

// Validation schemas
const validateFormDataSchema = Joi.object({
  schemaId: Joi.string().required(),
  data: Joi.object().required(),
});

/**
 * POST /api/validations/validate - Validate form data
 */
router.post('/validate', validateRequest(validateFormDataSchema), (req, res, next) =>
  validationsController.validateFormData(req, res, next)
);

export default router;
