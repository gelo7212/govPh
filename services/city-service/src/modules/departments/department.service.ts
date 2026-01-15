import { IDepartment , Department} from './department.schema';
export class DepartmentService {
 
  constructor() {}

  async getAllDepartments(filters?: { isActive?: boolean; cityCode?: string }) {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.cityCode) {
      query.cityCode = filters.cityCode;
    }
    return Department.find(query).lean().exec();
  }

  async getDepartmentById(id: string) {
    return Department.findById(id).lean().exec();
  }

  async getDepartmentByIds(ids: string[]) {
    return Department.find({ _id: { $in: ids } }).lean().exec();
  }

  async getDepartmentsByCity(cityCode: string, sosCapableOnly?: boolean) {
    const query: any = { cityCode, isActive: true };
    if (sosCapableOnly) {
      query.sosCapable = true;
    }
    return Department.find(query).lean().exec();
  }

  async createDepartment(data: Partial<IDepartment>) {
    const department = new Department(data);
    return department.save();
  }

  async updateDepartment(id: string, data: Partial<IDepartment>) {
    return Department
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
  }

  async deleteDepartment(id: string) {
    return Department.findByIdAndDelete(id).lean().exec();
  }

  async getDepartmentByCode(cityCode: string, code: string) {
    return Department
      .findOne({ cityCode, code })
      .lean()
      .exec();
  }

  async getDepartmentsByIncidentType(
    incidentType: string,
    cityCode?: string,
  ) {
    const query: any = {
      handlesIncidentTypes: incidentType,
      isActive: true,
    };
    if (cityCode) {
      query.cityCode = cityCode;
    }
    return Department.find(query).lean().exec();
  }
}
