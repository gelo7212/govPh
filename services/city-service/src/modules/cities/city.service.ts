import { Model } from 'mongoose';
import { ICity } from '../../types';

export class CityService {
  constructor(private cityModel: Model<ICity>) {}

  async getAllCities(filters?: { isActive?: boolean; provinceCode?: string }) {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.provinceCode) {
      query.provinceCode = filters.provinceCode;
    }
    return this.cityModel.find(query).lean().exec();
  }

  async getCityByCode(cityCode: string) {
    return this.cityModel.findOne({ cityCode }).lean().exec();
  }

  async createCity(data: Partial<ICity>) {
    const city = new this.cityModel(data);
    return city.save();
  }

  async updateCity(cityCode: string, data: Partial<ICity>) {
    return this.cityModel
      .findOneAndUpdate({ cityCode }, data, { new: true })
      .lean()
      .exec();
  }

  async deleteCity(cityCode: string) {
    return this.cityModel.findOneAndDelete({ cityCode }).lean().exec();
  }

  async getCitiesByProvince(provinceCode: string) {
    return this.cityModel
      .find({ provinceCode, isActive: true })
      .lean()
      .exec();
  }

  async countCities(provinceCode?: string) {
    const query: any = { isActive: true };
    if (provinceCode) {
      query.provinceCode = provinceCode;
    }
    return this.cityModel.countDocuments(query).exec();
  }
}
