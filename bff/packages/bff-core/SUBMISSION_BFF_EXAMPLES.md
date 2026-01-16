# Submission Service Client - BFF Usage Examples

## Express Route Examples

### Admin Routes for Form Management

```typescript
// routes/admin/forms.routes.ts
import { Router, Request, Response } from 'express';
import { SubmissionServiceClient } from '@gov-ph/bff-core';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();
const submissionClient = new SubmissionServiceClient(
  process.env.SUBMISSION_SERVICE_URL || 'http://submission-service:3006'
);

// Apply auth middleware
router.use(requireAuth);
router.use(requireRole('admin', 'dept_head'));

// ==================== GET Routes ====================

/**
 * GET /api/admin/forms - List all form schemas
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, skip = 0, limit = 20, formKey } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.getAllSchemas(
      {
        status: status as any,
        skip: Number(skip),
        limit: Number(limit),
        formKey: formKey as string
      },
      token
    );

    return res.json(response);
  } catch (error) {
    console.error('Error listing forms:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list forms' }
    });
  }
});

/**
 * GET /api/admin/forms/:id - Get specific form schema with submissions count
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    // Get schema
    const schemaResponse = await submissionClient.getSchemaById(id, token);
    
    if (!schemaResponse.success) {
      return res.status(404).json(schemaResponse);
    }

    // Get submissions count
    const submissionsResponse = await submissionClient.getAllSubmissions(
      { schemaId: id, skip: 0, limit: 1 },
      token
    );

    return res.json({
      success: true,
      data: {
        ...schemaResponse.data,
        submissionCount: submissionsResponse.data?.meta.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch form' }
    });
  }
});

// ==================== POST Routes ====================

/**
 * POST /api/admin/forms - Create new form schema
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { formKey, title, description, fields } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    // Validate required fields
    if (!formKey || !title || !fields || fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'formKey, title, and fields are required'
        }
      });
    }

    const response = await submissionClient.createSchema(
      { formKey, title, description, fields },
      token
    );

    if (response.success) {
      return res.status(201).json(response);
    } else {
      return res.status(400).json(response);
    }
  } catch (error) {
    console.error('Error creating form:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create form' }
    });
  }
});

/**
 * POST /api/admin/forms/:id/publish - Publish form schema
 */
router.post('/:id/publish', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.publishSchema(id, token);

    if (response.success) {
      return res.json(response);
    } else {
      return res.status(409).json(response); // SCHEMA_ALREADY_PUBLISHED
    }
  } catch (error) {
    console.error('Error publishing form:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to publish form' }
    });
  }
});

// ==================== PUT Routes ====================

/**
 * PUT /api/admin/forms/:id - Update form schema
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, fields } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.updateSchema(
      id,
      { title, description, fields },
      token
    );

    if (response.success) {
      return res.json(response);
    } else {
      return res.status(400).json(response);
    }
  } catch (error) {
    console.error('Error updating form:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update form' }
    });
  }
});

// ==================== DELETE Routes ====================

/**
 * DELETE /api/admin/forms/:id - Delete form schema
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.deleteSchema(id, token);
    return res.json(response);
  } catch (error) {
    console.error('Error deleting form:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete form' }
    });
  }
});

export default router;
```

### Citizen Routes for Form Submission

```typescript
// routes/citizen/submissions.routes.ts
import { Router, Request, Response } from 'express';
import { SubmissionServiceClient, SubmissionAggregator } from '@gov-ph/bff-core';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const submissionClient = new SubmissionServiceClient(
  process.env.SUBMISSION_SERVICE_URL || 'http://submission-service:3006'
);

router.use(requireAuth);

// ==================== Form Submission Workflow ====================

/**
 * GET /api/citizen/forms/:id - Get form to fill out
 */
router.get('/forms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const schemaResponse = await submissionClient.getSchemaById(id, token);
    
    if (!schemaResponse.success) {
      return res.status(404).json(schemaResponse);
    }

    // Get existing draft if any
    const draftsResponse = await submissionClient.getAllDrafts(
      { schemaId: id, limit: 1 },
      token
    );

    return res.json({
      success: true,
      data: {
        schema: schemaResponse.data,
        draft: draftsResponse.data?.items[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch form' }
    });
  }
});

/**
 * POST /api/citizen/forms/:id/validate - Validate form data
 */
router.post('/forms/:id/validate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.validateFormData(
      { schemaId: id, data },
      token
    );

    if (response.success && response.data) {
      // Calculate completion percentage
      const schemaResponse = await submissionClient.getSchemaById(id, token);
      const completionPercent = SubmissionAggregator.calculateCompletion(
        schemaResponse.data!,
        data
      );

      return res.json({
        success: true,
        data: {
          ...response.data,
          completionPercent
        }
      });
    }

    return res.json(response);
  } catch (error) {
    console.error('Error validating form:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to validate form' }
    });
  }
});

/**
 * POST /api/citizen/forms/:id/save-draft - Auto-save form draft
 */
router.post('/forms/:id/save-draft', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { formKey, data } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.saveDraft(
      { schemaId: id, formKey, data },
      token
    );

    return res.json(response);
  } catch (error) {
    console.error('Error saving draft:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to save draft' }
    });
  }
});

/**
 * POST /api/citizen/forms/:id/submit - Submit completed form
 */
router.post('/forms/:id/submit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { formKey, data, draftId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    // Validate first
    const validationResponse = await submissionClient.validateFormData(
      { schemaId: id, data },
      token
    );

    if (!validationResponse.data?.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Form has validation errors',
          details: validationResponse.data?.errors
        }
      });
    }

    // Submit
    const submissionResponse = await submissionClient.createSubmission(
      { schemaId: id, formKey, data },
      token
    );

    if (submissionResponse.success && draftId) {
      // Delete draft after successful submission
      await submissionClient.deleteDraft(draftId, token);
    }

    return res.json(submissionResponse);
  } catch (error) {
    console.error('Error submitting form:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to submit form' }
    });
  }
});

/**
 * GET /api/citizen/submissions - Get my submissions
 */
router.get('/my-submissions', async (req: Request, res: Response) => {
  try {
    const { status, skip = 0, limit = 20 } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.getAllSubmissions(
      {
        status: status as any,
        skip: Number(skip),
        limit: Number(limit)
      },
      token
    );

    return res.json(response);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch submissions' }
    });
  }
});

/**
 * GET /api/citizen/submissions/:id - Get specific submission details
 */
router.get('/submissions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.getSubmissionById(id, token);

    if (response.success) {
      // Enrich with schema
      const schemaResponse = await submissionClient.getSchemaById(
        response.data!.schemaId,
        token
      );

      if (schemaResponse.success) {
        const enriched = SubmissionAggregator.enrichSubmissionWithSchema(
          response.data!,
          schemaResponse.data!
        );

        return res.json({
          success: true,
          data: enriched
        });
      }
    }

    return res.json(response);
  } catch (error) {
    console.error('Error fetching submission:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch submission' }
    });
  }
});

export default router;
```

### Admin Routes for Submission Review

```typescript
// routes/admin/submissions.routes.ts
import { Router, Request, Response } from 'express';
import { SubmissionServiceClient, SubmissionAggregator } from '@gov-ph/bff-core';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();
const submissionClient = new SubmissionServiceClient(
  process.env.SUBMISSION_SERVICE_URL || 'http://submission-service:3006'
);

router.use(requireAuth);
router.use(requireRole('admin', 'dept_head'));

/**
 * GET /api/admin/submissions - List all submissions for review
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schemaId, status = 'SUBMITTED', skip = 0, limit = 20 } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.getAllSubmissions(
      {
        schemaId: schemaId as string,
        status: status as any,
        skip: Number(skip),
        limit: Number(limit)
      },
      token
    );

    return res.json(response);
  } catch (error) {
    console.error('Error listing submissions:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list submissions' }
    });
  }
});

/**
 * GET /api/admin/submissions/:id - Get submission for review
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const submissionResponse = await submissionClient.getSubmissionById(id, token);

    if (!submissionResponse.success) {
      return res.status(404).json(submissionResponse);
    }

    // Get schema for context
    const schemaResponse = await submissionClient.getSchemaById(
      submissionResponse.data!.schemaId,
      token
    );

    if (schemaResponse.success) {
      const formatted = SubmissionAggregator.formatSubmissionForDisplay(
        submissionResponse.data!,
        schemaResponse.data!
      );

      return res.json({
        success: true,
        data: formatted
      });
    }

    return res.json(submissionResponse);
  } catch (error) {
    console.error('Error fetching submission:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch submission' }
    });
  }
});

/**
 * POST /api/admin/submissions/:id/approve - Approve submission
 */
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.updateSubmission(
      id,
      {
        status: 'APPROVED',
        notes: notes || 'Approved by admin'
      },
      token
    );

    return res.json(response);
  } catch (error) {
    console.error('Error approving submission:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve submission' }
    });
  }
});

/**
 * POST /api/admin/submissions/:id/reject - Reject submission
 */
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await submissionClient.updateSubmission(
      id,
      {
        status: 'REJECTED',
        notes: notes || 'Rejected by admin'
      },
      token
    );

    return res.json(response);
  } catch (error) {
    console.error('Error rejecting submission:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reject submission' }
    });
  }
});

/**
 * GET /api/admin/submissions/stats/:schemaId - Get submission statistics
 */
router.get('/stats/:schemaId', async (req: Request, res: Response) => {
  try {
    const { schemaId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    // Get all submissions for schema (paginate if needed)
    const submissionsResponse = await submissionClient.getAllSubmissions(
      { schemaId, skip: 0, limit: 1000 },
      token
    );

    if (!submissionsResponse.success || !submissionsResponse.data?.items) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' }
      });
    }

    const stats = SubmissionAggregator.getSubmissionStats(
      submissionsResponse.data.items
    );

    return res.json({
      success: true,
      data: {
        schemaId,
        ...stats
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get statistics' }
    });
  }
});

export default router;
```

## Environment Configuration

Add to `.env` file in BFF applications:

```env
# Submission Service
SUBMISSION_SERVICE_URL=http://submission-service:3006
```

## Integration in Express App

```typescript
// app.ts
import express from 'express';
import formRoutes from './routes/admin/forms.routes';
import submissionsRoutes from './routes/citizen/submissions.routes';
import adminSubmissionsRoutes from './routes/admin/submissions.routes';

const app = express();

app.use(express.json());

// Admin routes
app.use('/api/admin/forms', formRoutes);
app.use('/api/admin/submissions', adminSubmissionsRoutes);

// Citizen routes
app.use('/api/citizen/submissions', submissionsRoutes);

export default app;
```

## Error Response Handling

All routes follow this pattern for consistent error handling:

```typescript
if (!response.success) {
  // Handle specific error codes
  switch (response.error?.code) {
    case 'VALIDATION_ERROR':
      return res.status(400).json(response);
    case 'SCHEMA_NOT_FOUND':
      return res.status(404).json(response);
    case 'UNAUTHORIZED':
      return res.status(401).json(response);
    case 'SCHEMA_ALREADY_PUBLISHED':
      return res.status(409).json(response);
    default:
      return res.status(500).json(response);
  }
}
```

---

These examples demonstrate production-ready integration patterns for both citizen and admin workflows.
