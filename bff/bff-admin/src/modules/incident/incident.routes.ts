import { Router } from 'express';
import { IncidentController } from './incident.controller';
import { authContextMiddleware } from '../../middlewares/authContext';
import { IncidentAggregator } from './incident.aggregator';
import { IncidentServiceClient, IncidentTimelineServiceClient } from '@gov-ph/bff-core';
import { preventActor } from '../../middlewares/requireActor';
export const incidentRoutes = Router();


const incidentClient = new IncidentServiceClient(
  process.env.INCIDENT_MS_URL || 'http://govph-incident:3000'
);
const incidentTimelineClient = new IncidentTimelineServiceClient(
  process.env.INCIDENT_MS_URL || 'http://govph-incident:3000'
);
const incidentAggregator = new IncidentAggregator(incidentClient, incidentTimelineClient);
const incidentController = new IncidentController(incidentAggregator);
/**
 * Incident Module Routes
 */

// Get report categories lookup
incidentRoutes.get('/reports/types/lookup', (req, res) => incidentController.getReportCategoriesLookup(req, res));

// ==================== Incident Endpoints ====================

incidentRoutes.use(authContextMiddleware, preventActor('ANON'));
// ==================== Incident Lookup Endpoints ====================

// Get incidents by city code (MORE SPECIFIC - must come before /:id)
incidentRoutes.get('/reports/city/:cityCode',authContextMiddleware, (req, res) =>
  incidentController.getIncidentsByCity(req, res)
);

// Get incident by ID (LESS SPECIFIC - comes after more specific routes)
incidentRoutes.get('/reports/:id', authContextMiddleware,  (req, res) => incidentController.getIncidentById(req, res));

// Update incident status
incidentRoutes.patch('/reports/:id/status',authContextMiddleware, (req, res) =>
  incidentController.updateIncidentStatus(req, res)
);

// Update incident
incidentRoutes.put('/reports/:id',authContextMiddleware, (req, res) => incidentController.updateIncident(req, res));

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
