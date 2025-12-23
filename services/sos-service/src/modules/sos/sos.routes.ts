import { Router } from 'express';
import { SOSController } from './sos.controller';
import { SOSService } from './sos.service';
import { SOSRepository } from './sos.repository';
import { StatusMachineService } from './statusMachine.service';
import { validate, createSOSSchema, updateLocationSchema, sendMessageSchema, closeSOSSchema } from '../../utils/validators';

const router = Router();
const repository = new SOSRepository();
const service = new SOSService(repository);
const statusMachine = new StatusMachineService(repository);
const controller = new SOSController(service, statusMachine);

// Public endpoints (via BFF)

// Create SOS
router.post('/', validate(createSOSSchema), (req, res) => controller.createSOS(req, res));

// List active SOS (with optional status filter)
router.get('/', (req, res) => controller.listSOS(req, res));

// Get specific SOS
router.get('/:sosId', (req, res) => controller.getSOS(req, res));

// Update citizen location
router.post('/:sosId/location', validate(updateLocationSchema), (req, res) => controller.updateLocation(req, res));

// Send message
router.post('/:sosId/messages', validate(sendMessageSchema), (req, res) => controller.sendMessage(req, res));

// Cancel SOS
router.post('/:sosId/cancel', (req, res) => controller.cancelSOS(req, res));

// Close/Resolve SOS
router.post('/:sosId/close', validate(closeSOSSchema), (req, res) => controller.closeSOS(req, res));

export default router;
