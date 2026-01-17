import { Router, Request, Response, NextFunction } from 'express';
import { AdminSubmissionController } from './submission.controller';
import { AdminSubmissionAggregator } from './submission.aggregator';
import { SubmissionServiceClient } from '@gov-ph/bff-core';
import { authContextMiddleware } from '../../middlewares/authContext';
import multer from 'multer';


export const submissionRoutes = Router();
// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB default
  },
});
// Initialize dependencies
const submissionClient = new SubmissionServiceClient(
  process.env.SUBMISSION_SERVICE_URL || 'http://govph-submission:3000'
);
const submissionAggregator = new AdminSubmissionAggregator(submissionClient);
const submissionController = new AdminSubmissionController(submissionAggregator);

// Middleware: Require authentication and admin role
submissionRoutes.use(authContextMiddleware);

// ==================== FILE UPLOADS ====================

submissionRoutes.post('/upload', (req: any, res: any, next: any) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) return next(err);
    submissionController.uploadFile(req, res);
  });
});

// ==================== SCHEMAS ====================


submissionRoutes.get('/schemas/:schemaId', (req, res) =>
  submissionController.getSchemaById(req, res)
);

// ==================== SUBMISSIONS ====================

/**
 * Submission Review Management
 */
submissionRoutes.get('/submissions', (req, res) =>
  submissionController.getAllSubmissions(req, res)
);


submissionRoutes.get('/submissions/:submissionId', (req, res) =>
  submissionController.getSubmissionById(req, res)
);

submissionRoutes.post('/submissions', (req, res) =>
  submissionController.submitSubmission(req, res)
);

// ==================== DRAFTS ====================

/**
 * Draft Management
 */
submissionRoutes.get('/drafts', (req, res) =>
  submissionController.getAllDrafts(req, res)
);


submissionRoutes.post('/drafts', (req, res) =>
  submissionController.saveDraft(req, res)
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

