import { Router } from 'express';
import { SOSController } from './sos.controller';
import { SOSService } from './sos.service';
import { SOSRepository } from './sos.repository';
import { StatusMachineService } from './statusMachine.service';
import { validate, createSOSSchema, updateLocationSchema, sendMessageSchema, closeSOSSchema } from '../../utils/validators';
import { CounterService } from '../counter';
import { ParticipantRepository, SosParticipantService } from '../sos_participants';
const router = Router();
const repository = new SOSRepository();
const sosParticipantRepository = new ParticipantRepository( );
const sosParticipantService = new SosParticipantService(sosParticipantRepository);
const service = new SOSService(repository, sosParticipantService);
const statusMachine = new StatusMachineService(repository);
const counterService = new CounterService();
const controller = new SOSController(service, statusMachine, counterService);

// Public endpoints (via BFF)

// Create SOS
router.post('/', validate(createSOSSchema), (req, res, next) =>
  controller.createSOS(req, res).catch(next)
);

// List active SOS (with optional status filter)
router.get('/', (req, res, next) =>
  controller.listSOS(req, res).catch(next)
);

// Get specific SOS
router.get('/:sosId', (req, res, next) =>
  controller.getSOS(req, res).catch(next)
);

// Get active SOS for citizen
router.get('/citizen/active', (req, res, next) =>
  controller.getActiveSOSByCitizen(req, res).catch(next)
);

// update SOS tag
router.patch('/:sosId/tag', (req, res, next) =>
  controller.updateSosTag(req, res).catch(next)
);

// Update citizen location
router.post('/:sosId/location', validate(updateLocationSchema), (req, res, next) =>
  controller.updateLocation(req, res).catch(next)
);

router.patch('/:sosId/status', (req, res, next) =>
  controller.updateSOSStatus(req, res).catch(next)
);

// // Send message
// router.post('/:sosId/messages', validate(sendMessageSchema), (req, res, next) =>
//   controller.sendMessage(req, res).catch(next)
// );

// Cancel SOS
router.post('/:sosId/cancel', (req, res, next) =>
  controller.cancelSOS(req, res).catch(next)
);

// Close/Resolve SOS
router.post('/:sosId/close', validate(closeSOSSchema), (req, res, next) =>
  controller.closeSOS(req, res).catch(next)
);

// Internal endpoint: Save location snapshot from realtime service
router.post('/:sosId/location-snapshot', (req, res, next) =>
  controller.saveLocationSnapshot(req, res).catch(next)
);

// Create anonymous rescuer identity for SOS
router.post('/:sosId/anon-rescuer', (req, res, next) =>
  controller.createAnonRescuer(req, res).catch(next)
);
export default router;
