import { Model } from 'mongoose';
import { IDepartment } from './department.schema';
export class DepartmentService {
  constructor(private departmentModel: Model<IDepartment>) {}

  async getAllDepartments(filters?: { isActive?: boolean; cityCode?: string }) {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.cityCode) {
      query.cityCode = filters.cityCode;
    }
    return this.departmentModel.find(query).lean().exec();
  }

  async getDepartmentById(id: string) {
    return this.departmentModel.findById(id).lean().exec();
  }

  async getDepartmentsByCity(cityCode: string, sosCapableOnly?: boolean) {
    const query: any = { cityCode, isActive: true };
    if (sosCapableOnly) {
      query.sosCapable = true;
    }
    return this.departmentModel.find(query).lean().exec();
  }

  async createDepartment(data: Partial<IDepartment>) {
    const department = new this.departmentModel(data);
    return department.save();
  }

  async updateDepartment(id: string, data: Partial<IDepartment>) {
    return this.departmentModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
  }

  async deleteDepartment(id: string) {
    return this.departmentModel.findByIdAndDelete(id).lean().exec();
  }

  async getDepartmentByCode(cityCode: string, code: string) {
    return this.departmentModel
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
    return this.departmentModel.find(query).lean().exec();
  }
}
