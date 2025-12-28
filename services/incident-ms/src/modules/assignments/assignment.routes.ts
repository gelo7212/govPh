import { Router } from 'express';
import { assignmentController } from './assignment.controller';

const router = Router();

/**
 * Assignment Routes
 */

// Create assignment
router.post('/', (req, res) => assignmentController.createAssignment(req, res));

// Get assignment by ID
router.get('/:id', (req, res) =>
  assignmentController.getAssignmentById(req, res)
);

// Get assignments by incident ID
router.get('/incident/:incidentId', (req, res) =>
  assignmentController.getAssignmentsByIncidentId(req, res)
);

// Get assignments by city and department
router.get('/department/:cityCode/:departmentCode', (req, res) =>
  assignmentController.getAssignmentsByCityAndDepartment(req, res)
);

// Get assignments by responder ID
router.get('/responder/:responderId', (req, res) =>
  assignmentController.getAssignmentsByResponderId(req, res)
);

// Update assignment status
router.patch('/:id/status', (req, res) =>
  assignmentController.updateAssignmentStatus(req, res)
);

// Accept assignment
router.post('/:id/accept', (req, res) =>
  assignmentController.acceptAssignment(req, res)
);

// Reject assignment
router.post('/:id/reject', (req, res) =>
  assignmentController.rejectAssignment(req, res)
);

// Complete assignment
router.post('/:id/complete', (req, res) =>
  assignmentController.completeAssignment(req, res)
);

// Update assignment
router.put('/:id', (req, res) =>
  assignmentController.updateAssignment(req, res)
);

// Delete assignment
router.delete('/:id', (req, res) =>
  assignmentController.deleteAssignment(req, res)
);

export default router;
