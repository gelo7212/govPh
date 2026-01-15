import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';


const departmentService = new DepartmentService();
export const departmentController = new DepartmentController(departmentService);
