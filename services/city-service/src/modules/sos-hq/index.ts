import mongoose from 'mongoose';
import { SosHQSchema } from './sos-hq.schema';
import { SosHQService } from './sos-hq.service';
import { SosHQController } from './sos-hq.controller';

const SosHQ = mongoose.model('SosHQ', SosHQSchema);
const sosHQService = new SosHQService(SosHQ as any);
export const sosHQController = new SosHQController(sosHQService);
