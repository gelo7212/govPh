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
router.get('/assignment', (req, res, next) =>
  controller.getAssignment(req, res).catch(next)
);

// Update rescuer location
router.post('/location', validate(rescuerLocationSchema), (req, res, next) =>
  controller.updateRescuerLocation(req, res).catch(next)
);

// Update rescuer SOS status 
router.post('/sos-status', (req, res, next) =>
  controller.updateRescuerSosStatus(req, res).catch(next)
);


// Get rescuers by city
router.get(
  '/municipality/:municipalityCode',
  (req, res, next) =>
    controller.getRescuersByCity(req, res).catch(next)
);

export default router;
