import mongoose from 'mongoose';
import { DepartmentSchema } from './department.schema';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';

const Department = mongoose.model('Department', DepartmentSchema);
const departmentService = new DepartmentService(Department as any);
export const departmentController = new DepartmentController(departmentService);
