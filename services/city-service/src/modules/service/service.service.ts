import { Model } from 'mongoose';
import { IService } from './service.schema';

export class ServiceService {
  constructor(private serviceModel: Model<IService>) {}

  async getServiceById(serviceId: string) {
    return this.serviceModel.findById(serviceId).lean().exec();
  }

  async getServiceByCode(cityId: string, code: string) {
    return this.serviceModel.findOne({ cityId, code }).lean().exec();
  }

  async getServicesByCity(cityId: string, filters?: { isActive?: boolean; category?: string }) {
    const query: any = { cityId };
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.category) {
      query.category = filters.category;
    }
    return this.serviceModel.find(query).lean().exec();
  }

  async getAllServices(filters?: { isActive?: boolean; category?: string; cityId?: string }) {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.category) {
      query.category = filters.category;
    }
    if (filters?.cityId) {
      query.cityId = filters.cityId;
    }
    return this.serviceModel.find(query).lean().exec();
  }

  async createService(data: Partial<IService>) {
    const service = new this.serviceModel(data);
    return service.save();
  }

  async updateService(serviceId: string, data: Partial<IService>) {
    return this.serviceModel
      .findByIdAndUpdate(serviceId, data, { new: true })
      .lean()
      .exec();
  }

  async deleteService(serviceId: string) {
    return this.serviceModel.findByIdAndDelete(serviceId).lean().exec();
  }

  async archiveService(serviceId: string) {
    return this.serviceModel
      .findByIdAndUpdate(serviceId, { isActive: false }, { new: true })
      .lean()
      .exec();
  }

  async activateService(serviceId: string) {
    return this.serviceModel
      .findByIdAndUpdate(serviceId, { isActive: true }, { new: true })
      .lean()
      .exec();
  }

  async updateServiceForm(
    serviceId: string,
    formType: 'infoForm' | 'applicationForm',
    formData: { formId: string; version?: number },
  ) {
    return this.serviceModel
      .findByIdAndUpdate(serviceId, { [formType]: formData }, { new: true })
      .lean()
      .exec();
  }

  async updateServiceAvailability(
    serviceId: string,
    availability: { startAt?: Date; endAt?: Date },
  ) {
    return this.serviceModel
      .findByIdAndUpdate(serviceId, { availability }, { new: true })
      .lean()
      .exec();
  }

  async getServicesByCategory(cityId: string, category: string, isActive?: boolean) {
    const query: any = { cityId, category };
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    return this.serviceModel.find(query).lean().exec();
  }

  async countServicesByCity(cityId: string, filters?: { isActive?: boolean }) {
    const query: any = { cityId };
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    return this.serviceModel.countDocuments(query).exec();
  }
}
