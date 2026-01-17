import { Router } from 'express';
import Joi from 'joi';
import { SubmissionsController } from './submissions.controller';
import { validateRequest } from '../../middlewares/schema.validator.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
const submissionsController = new SubmissionsController();

// Validation schemas
const createSubmissionSchema = Joi.object({
  schemaId: Joi.string().required(),
  formKey: Joi.string().required(),
  data: Joi.object().required(),
});

const updateSubmissionSchema = Joi.object({
  status: Joi.string()
    .valid('SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED')
    .optional(),
  data: Joi.object().optional(),
  notes: Joi.string().optional(),
});

/**
 * GET /api/submissions - List submissions
 */
router.get('/', authenticateToken(['CITY_ADMIN', 'SK_ADMIN']), (req, res, next) =>
  submissionsController.getAllSubmissions(req, res, next)
);
/**
 * GET /api/submissions/:id - Get submission
 */
router.get('/:id',authenticateToken(['CITY_ADMIN', 'SK_ADMIN','CITIZEN']), (req, res, next) =>
  submissionsController.getSubmissionById(req, res, next)
);

/**
 * DELETE /api/submissions/:id - Delete submission
 */
router.delete('/:id', authenticateToken(['CITY_ADMIN', 'SK_ADMIN']), (req, res, next) =>
  submissionsController.deleteSubmission(req, res, next)
);

// CITIZEN routes

router.use(authenticateToken(['CITIZEN']));

/**
 * POST /api/submissions - Create submission
 */
router.post('/', validateRequest(createSubmissionSchema), (req, res, next) =>
  submissionsController.createSubmission(req, res, next)
);

/**
 * PUT /api/submissions/:id - Update submission
 */
router.put('/:id', validateRequest(updateSubmissionSchema), (req, res, next) =>
  submissionsController.updateSubmission(req, res, next)
);



export default router;