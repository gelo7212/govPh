import { model } from 'mongoose';
import { ServiceSchema, IService } from './service.schema';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';

const serviceModel = model<IService>('Service', ServiceSchema);
const serviceService = new ServiceService(serviceModel);
export const serviceController = new ServiceController(serviceService);

export { ServiceService } from './service.service';
export { ServiceController } from './service.controller';
export { IService } from './service.schema';
