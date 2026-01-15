import mongoose from 'mongoose';
import { SosHQSchema } from './sos-hq.schema';
import { SosHQService } from './sos-hq.service';
import { SosHQController } from './sos-hq.controller';
import { IdentityClient } from '../../services/identity.client';
import { DepartmentService } from '../departments/department.service';

const SosHQ = mongoose.model('SosHQ', SosHQSchema);
const sosHQService = new SosHQService(SosHQ as any);
const identityClient = new IdentityClient();

const departmentService = new DepartmentService();
export const sosHQController = new SosHQController(sosHQService, identityClient, departmentService);
    