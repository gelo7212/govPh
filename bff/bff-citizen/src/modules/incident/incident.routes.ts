import { Router } from 'express';
import { incidentController } from './incident.controller';

const router = Router();

/**
 * Incident Module Routes
 */

// ==================== Incident Endpoints ====================

// Create incident
router.post('/', (req, res) => incidentController.createIncident(req, res));

// Get all incidents
router.get('/', (req, res) => incidentController.getAllIncidents(req, res));

// Get incident by ID
router.get('/:id', (req, res) => incidentController.getIncidentById(req, res));

// Get incidents by city code
router.get('/city/:cityCode', (req, res) =>
  incidentController.getIncidentsByCity(req, res)
);

// Get incidents by user ID
router.get('/user/:userId', (req, res) =>
  incidentController.getIncidentsByUserId(req, res)
);

// Update incident status
router.patch('/:id/status', (req, res) =>
  incidentController.updateIncidentStatus(req, res)
);

// Update incident
router.put('/:id', (req, res) => incidentController.updateIncident(req, res));

// Delete incident
router.delete('/:id', (req, res) =>
  incidentController.deleteIncident(req, res)
);

// ==================== Assignment Endpoints ====================

// Create assignment
router.post('/assignments', (req, res) =>
  incidentController.createAssignment(req, res)
);

// Get assignment by ID
router.get('/assignments/:id', (req, res) =>
  incidentController.getAssignmentById(req, res)
);

// Get assignments by incident ID
router.get('/assignments/incident/:incidentId', (req, res) =>
  incidentController.getAssignmentsByIncidentId(req, res)
);

// Get assignments by city and department
router.get('/assignments/department/:cityCode/:departmentCode', (req, res) =>
  incidentController.getAssignmentsByCityAndDepartment(req, res)
);

// Get assignments by responder ID
router.get('/assignments/responder/:responderId', (req, res) =>
  incidentController.getAssignmentsByResponderId(req, res)
);

// Accept assignment
router.post('/assignments/:id/accept', (req, res) =>
  incidentController.acceptAssignment(req, res)
);

// Reject assignment
router.post('/assignments/:id/reject', (req, res) =>
  incidentController.rejectAssignment(req, res)
);

// Complete assignment
router.post('/assignments/:id/complete', (req, res) =>
  incidentController.completeAssignment(req, res)
);

export default router;
