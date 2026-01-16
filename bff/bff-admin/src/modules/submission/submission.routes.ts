import { Router } from 'express';
import { AdminSubmissionController } from './submission.controller';
import { AdminSubmissionAggregator } from './submission.aggregator';
import { SubmissionServiceClient } from '@gov-ph/bff-core';
import { authContextMiddleware } from '../../middlewares/authContext';
import { requireRole } from '../../middlewares/requireRole';

export const submissionRoutes = Router();

// Initialize dependencies
const submissionClient = new SubmissionServiceClient(
  process.env.SUBMISSION_SERVICE_URL || 'http://govph-submission:3000'
);
const submissionAggregator = new AdminSubmissionAggregator(submissionClient);
const submissionController = new AdminSubmissionController(submissionAggregator);

// Middleware: Require authentication and admin role
submissionRoutes.use(authContextMiddleware);
submissionRoutes.use(requireRole('APP_ADMIN', 'SOS_ADMIN', 'SK_ADMIN', 'CITY_ADMIN'));

// ==================== SCHEMAS ====================

/**
 * Form Schema Management
 */
submissionRoutes.get('/schemas', (req, res) =>
  submissionController.getAllSchemas(req, res)
);

submissionRoutes.get('/schemas/:schemaId', (req, res) =>
  submissionController.getSchemaById(req, res)
);

submissionRoutes.post('/schemas', (req, res) =>
  submissionController.createSchema(req, res)
);

submissionRoutes.put('/schemas/:schemaId', (req, res) =>
  submissionController.updateSchema(req, res)
);

submissionRoutes.delete('/schemas/:schemaId', (req, res) =>
  submissionController.deleteSchema(req, res)
);

submissionRoutes.post('/schemas/:schemaId/publish', (req, res) =>
  submissionController.publishSchema(req, res)
);

// ==================== SUBMISSIONS ====================

/**
 * Submission Review Management
 */
submissionRoutes.get('/submissions', (req, res) =>
  submissionController.getAllSubmissions(req, res)
);

submissionRoutes.get('/submissions/stats', (req, res) =>
  submissionController.getSubmissionStats(req, res)
);

submissionRoutes.get('/submissions/:submissionId', (req, res) =>
  submissionController.getSubmissionById(req, res)
);

submissionRoutes.put('/submissions/:submissionId/status', (req, res) =>
  submissionController.updateSubmissionStatus(req, res)
);

submissionRoutes.delete('/submissions/:submissionId', (req, res) =>
  submissionController.deleteSubmission(req, res)
);

// ==================== DRAFTS ====================

/**
 * Draft Management
 */
submissionRoutes.get('/drafts', (req, res) =>
  submissionController.getAllDrafts(req, res)
);

submissionRoutes.get('/drafts/:draftId', (req, res) =>
  submissionController.getDraftById(req, res)
);

submissionRoutes.delete('/drafts/:draftId', (req, res) =>
  submissionController.deleteDraft(req, res)
);

// ==================== VALIDATIONS ====================

/**
 * Form Validation
 */
submissionRoutes.post('/validate', (req, res) =>
  submissionController.validateFormData(req, res)
);
