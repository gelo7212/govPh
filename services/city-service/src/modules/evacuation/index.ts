import { EvacuationCenterService } from './evacuation.service';
import { EvacuationCenterController } from './evacuation.controller';

const evacuationCenterService = new EvacuationCenterService();
export const evacuationCenterController = new EvacuationCenterController(
  evacuationCenterService,
);
