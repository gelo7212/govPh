import { Router } from 'express';
import { IncidentController } from './incident.controller';
import { authContextMiddleware } from '../../middlewares/authContext';
import { IncidentAggregator } from './incident.aggregator';
import { IncidentServiceClient } from '@gov-ph/bff-core';
export const incidentRoutes = Router();


const incidentClient = new IncidentServiceClient(
  process.env.INCIDENT_MS_URL || 'http://govph-incident:3000'
);
const incidentAggregator = new IncidentAggregator(incidentClient);
const incidentController = new IncidentController(incidentAggregator);
/**
 * Incident Module Routes
 */

// ==================== Incident Endpoints ====================

// Create incident
incidentRoutes.post('/reports',authContextMiddleware, (req, res) => incidentController.createIncident(req, res));

// Get incidents by city code (MORE SPECIFIC - must come before /:id)
incidentRoutes.get('/reports/city/:cityCode',authContextMiddleware, (req, res) =>
  incidentController.getIncidentsByCity(req, res)
);

// Get incidents by user ID
incidentRoutes.get('/reports/user/:userId',authContextMiddleware, (req, res) =>
  incidentController.getIncidentsByUserId(req, res)
);

// Get incident by ID (LESS SPECIFIC - comes after more specific routes)
incidentRoutes.get('/reports/:id', authContextMiddleware,  (req, res) => incidentController.getIncidentById(req, res));

// Get all incidents
incidentRoutes.get('/reports',authContextMiddleware, (req, res) => incidentController.getAllIncidents(req, res));



// Update incident status
incidentRoutes.patch('/reports/:id/status',authContextMiddleware, (req, res) =>
  incidentController.updateIncidentStatus(req, res)
);

// cancel incident
incidentRoutes.post('/reports/:id/cancel',authContextMiddleware, (req, res) =>
  incidentController.cancelIncident(req, res)
);

// Update incident
incidentRoutes.put('/reports/:id',authContextMiddleware, (req, res) => incidentController.updateIncident(req, res));

// Delete incident
incidentRoutes.delete('/reports/:id',authContextMiddleware, (req, res) =>
  incidentController.deleteIncident(req, res)
);

// ==================== Assignment Endpoints ====================

// Create assignment
incidentRoutes.post('/assignments',authContextMiddleware, (req, res) =>
  incidentController.createAssignment(req, res)
);

// Get assignment by ID
incidentRoutes.get('/assignments/:id',authContextMiddleware, (req, res) =>
  incidentController.getAssignmentById(req, res)
);

// Get assignments by incident ID
incidentRoutes.get('/assignments/incident/:incidentId',authContextMiddleware, (req, res) =>
  incidentController.getAssignmentsByIncidentId(req, res)
);

// Get assignments by city and department
incidentRoutes.get('/assignments/department/:cityCode/:departmentCode',authContextMiddleware, (req, res) =>
  incidentController.getAssignmentsByCityAndDepartment(req, res)
);

// Get assignments by responder ID
incidentRoutes.get('/assignments/responder/:responderId',authContextMiddleware, (req, res) =>
  incidentController.getAssignmentsByResponderId(req, res)
);

// Accept assignment
incidentRoutes.post('/assignments/:id/accept',authContextMiddleware, (req, res) =>
  incidentController.acceptAssignment(req, res)
);

// Reject assignment
incidentRoutes.post('/assignments/:id/reject',authContextMiddleware, (req, res) =>
  incidentController.rejectAssignment(req, res)
);

// Complete assignment
incidentRoutes.post('/assignments/:id/complete',authContextMiddleware, (req, res) =>
  incidentController.completeAssignment(req, res)
);
