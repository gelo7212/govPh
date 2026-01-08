import { Router } from 'express';
import { incidentController } from './incident.controller';

const router = Router();

/**
 * Incident Routes
 */

// Create incident
router.post('/', (req, res) => incidentController.createIncident(req, res));

// Get all incidents
router.get('/', (req, res) => incidentController.getAllIncidents(req, res));

// Get incident by ID
router.get('/:id', (req, res) => incidentController.getIncidentById(req, res));

// Get incidents by city
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
router.put('/:id', (req, res) =>
  incidentController.updateIncident(req, res)
);

// Delete incident
router.delete('/:id', (req, res) =>
  incidentController.deleteIncident(req, res)
);

router.get('/department/:departmentId', (req, res) =>
  incidentController.getIncidentByDepartmentId(req, res)
);

export default router;
