import { Router } from 'express';
import { DispatchController } from './dispatch.controller';
import { SOSRepository } from '../sos/sos.repository';
import { StatusMachineService } from '../sos/statusMachine.service';
import { validate, dispatchAssignSchema } from '../../utils/validators';

const router = Router();
const sosRepository = new SOSRepository();
const statusMachine = new StatusMachineService(sosRepository);
const controller = new DispatchController(sosRepository, statusMachine);

// Assign rescuer to SOS
router.post('/assign', validate(dispatchAssignSchema), (req, res, next) =>
  controller.assignRescuer(req, res).catch(next)
);

router.get('/rescuer/:assignedRescuerId/history', (req, res, next) =>
  controller.getDispatcherHistory(req, res).catch(next)
);

export default router;
