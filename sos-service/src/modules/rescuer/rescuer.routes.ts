import { Router } from 'express';
import { RescuerController } from './rescuer.controller';
import { SOSRepository } from '../sos/sos.repository';
import { StatusMachineService } from '../sos/statusMachine.service';
import { validate, rescuerLocationSchema } from '../../utils/validators';

const router = Router();
const sosRepository = new SOSRepository();
const statusMachine = new StatusMachineService(sosRepository);
const controller = new RescuerController(sosRepository, statusMachine);

// Get assigned SOS
router.get('/assignment', (req, res) => controller.getAssignment(req, res));

// Update rescuer location
router.post('/location', validate(rescuerLocationSchema), (req, res) =>
  controller.updateRescuerLocation(req, res),
);

export default router;
