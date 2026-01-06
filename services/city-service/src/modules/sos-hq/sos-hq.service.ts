import { Model } from 'mongoose';
import { ISosHQ } from './sos-hq.schema';

export class SosHQService {
  constructor(private sosHQModel: Model<ISosHQ>) {}

  async getAllSosHQ(filters?: {
    isActive?: boolean;
    cityCode?: string;
    provinceCode?: string;
    scopeLevel?: 'CITY' | 'PROVINCE';
  }) {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.cityCode) {
      query.cityCode = filters.cityCode;
    }
    if (filters?.provinceCode) {
      query.provinceCode = filters.provinceCode;
    }
    if (filters?.scopeLevel) {
      query.scopeLevel = filters.scopeLevel;
    }
    return this.sosHQModel.find(query).lean().exec();
  }

  async getSosHQById(id: string) {
    return this.sosHQModel.findById(id).lean().exec();
  }

  async getSosHQByCity(cityCode: string) {
    return this.sosHQModel
      .find({ cityCode, isActive: true, scopeLevel: 'CITY' })
      .lean()
      .exec();
  }

  async getSosHQByProvince(provinceCode: string) {
    return this.sosHQModel
      .find({ provinceCode, isActive: true, scopeLevel: 'PROVINCE' })
      .lean()
      .exec();
  }

  async getMainSosHQ(cityCode?: string, provinceCode?: string) {
    const query: any = { isMain: true, isActive: true };
    if (cityCode) {
      query.cityCode = cityCode;
      query.scopeLevel = 'CITY';
    } else if (provinceCode) {
      query.provinceCode = provinceCode;
      query.scopeLevel = 'PROVINCE';
    }
    return this.sosHQModel.findOne(query).lean().exec();
  }

  async createSosHQ(data: Partial<ISosHQ>) {
    const sosHQ = new this.sosHQModel(data);
    return sosHQ.save();
  }

  async updateSosHQ(id: string, data: Partial<ISosHQ>) {
    return this.sosHQModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
  }

  async deleteSosHQ(id: string) {
    return this.sosHQModel.findByIdAndDelete(id).lean().exec();
  }

  async activateSosHQ(id: string) {
    return this.sosHQModel
      .findByIdAndUpdate(
        id,
        {
          isActive: true,
          activatedAt: new Date(),
          deactivatedAt: null,
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  async deactivateSosHQ(id: string) {
    return this.sosHQModel
      .findByIdAndUpdate(
        id,
        {
          isActive: false,
          deactivatedAt: new Date(),
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  async getSosHQBySupportedDepartment(
    departmentCode: string,
    cityCode?: string,
  ) {
    const query: any = {
      supportedDepartmentCodes: departmentCode,
      isActive: true,
    };
    if (cityCode) {
      query.cityCode = cityCode;
    }
    return this.sosHQModel.find(query).lean().exec();
  }

  async getNearestSosHQ(
    latitude: number,
    longitude: number,
    maxDistanceKm: number = 6,
  ): Promise<ISosHQ | null> {
    const query: any = {
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], // Note: GeoJSON uses [longitude, latitude]
          },
          $maxDistance: maxDistanceKm * 1000, // Convert km to meters
        },
      },
    };

    return this.sosHQModel.findOne(query).lean().exec();
  }
}
