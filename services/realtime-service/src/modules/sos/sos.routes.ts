import { Router } from 'express';
import { SOSController } from './sos.controller';
import { SOSService } from './sos.service';
import { StatusMachineService } from './statusMachine.service';
import { internalAuthMiddleware } from '../../middleware/internalAuth.middleware';
import { validate } from '../../utils/validators';
import { initSOSSchema, closeSOSSchema, updateStatusSchema } from './sos.schema';

const router = Router();

// Initialize services
const service = new SOSService();
const statusMachine = new StatusMachineService();
const controller = new SOSController(service, statusMachine);

// All routes require internal authentication
router.use(internalAuthMiddleware);

// Initialize SOS realtime context
router.post('/init', validate(initSOSSchema), (req, res) => {
  controller.initSOS(req, res);
});

// Close SOS realtime context
router.post('/:sosId/close', validate(closeSOSSchema), (req, res) => {
  controller.closeSOS(req, res);
});

// Update SOS status
router.post('/:sosId/status', validate(updateStatusSchema), (req, res) => {
  controller.updateStatus(req, res);
});

// get all SOS realtime sos by radius (MUST be before /:sosId routes)
router.get('/nearby', (req, res) => {
  controller.getNearbySOSStates(req, res);
});

// Get SOS realtime state
router.get('/:sosId/state', (req, res) => {
  controller.getSOSState(req, res);
});

// Save location snapshot from realtime sampler
router.post('/:sosId/location', (req, res) => {
  controller.saveLocationSnapshot(req, res);
}); 

router.post('/:sosId/rescue', (req, res) => {
  controller.upsertRescuerLocation(req, res);
});

export default router;
