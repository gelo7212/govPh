import { Router } from 'express';
import { incidentTimelineController } from './incident-timeline.controller';

const router = Router();

/**
 * Incident Timeline Routes
 * NOTE: Order matters - specific routes before generic parameter routes
 */

// Create a new timeline event
router.post('/', (req, res) =>
  incidentTimelineController.createTimelineEvent(req, res)
);

// Get timeline events by actor ID (specific route)
router.get('/actor/:actorId', (req, res) =>
  incidentTimelineController.getTimelineByActorId(req, res)
);

// Get timeline event by ID with /event suffix (specific route)
router.get('/:timelineId/event', (req, res) =>
  incidentTimelineController.getTimelineEventById(req, res)
);

// Get timeline events count for an incident (specific route)
router.get('/:incidentId/count', (req, res) =>
  incidentTimelineController.getTimelineEventCountByIncidentId(req, res)
);

// Get timeline events filtered by event type (specific route)
router.get('/:incidentId/events', (req, res) =>
  incidentTimelineController.getTimelineByIncidentIdAndEventType(req, res)
);

// Get timeline events by incident ID (generic route - goes last)
router.get('/:incidentId', (req, res) =>
  incidentTimelineController.getTimelineByIncidentId(req, res)
);


export default router;
