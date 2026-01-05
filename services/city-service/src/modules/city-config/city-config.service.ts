import { Model } from 'mongoose';
import { ICityConfig } from './city-config.schema';

export class CityConfigService {
  constructor(private cityConfigModel: Model<ICityConfig>) {}

  async getCityConfig(cityCode: string) {
    return this.cityConfigModel.findOne({ cityCode }).lean().exec();
  }

  async createCityConfig(data: Partial<ICityConfig>) {
    const config = new this.cityConfigModel(data);
    return config.save();
  }

  async updateCityConfig(cityCode: string, data: Partial<ICityConfig>) {
    return this.cityConfigModel
      .findOneAndUpdate({ cityCode }, data, { new: true })
      .lean()
      .exec();
  }

  async deleteCityConfig(cityCode: string) {
    return this.cityConfigModel.findOneAndDelete({ cityCode }).lean().exec();
  }

  async getAllConfigs(filters?: { isActive?: boolean }) {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    return this.cityConfigModel.find(query).lean().exec();
  }

  async updateIncidentRules(
    cityCode: string,
    rules: Partial<ICityConfig['incident']>,
  ) {
    return this.cityConfigModel
      .findOneAndUpdate({ cityCode }, { incident: rules }, { new: true })
      .lean()
      .exec();
  }

  async updateSosRules(cityCode: string, rules: Partial<ICityConfig['sos']>) {
    return this.cityConfigModel
      .findOneAndUpdate({ cityCode }, { sos: rules }, { new: true })
      .lean()
      .exec();
  }

  async updateVisibilityRules(
    cityCode: string,
    rules: Partial<ICityConfig['visibility']>,
  ) {
    return this.cityConfigModel
      .findOneAndUpdate({ cityCode }, { visibility: rules }, { new: true })
      .lean()
      .exec();
  }

  async initializeSetup(cityCode: string, userId: string) {
    return this.cityConfigModel
      .findOneAndUpdate(
        { cityCode },
        {
          'setup.isInitialized': true,
          'setup.initializedAt': new Date(),
          'setup.initializedByUserId': userId,
          'setup.currentStep': 'CITY_PROFILE',
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  async updateSetupStep(
    cityCode: string,
    step: 'CITY_PROFILE' | 'DEPARTMENTS' | 'SOS_HQ' | 'SETTINGS' | 'COMPLETED',
  ) {
    return this.cityConfigModel
      .findOneAndUpdate(
        { cityCode },
        {
          'setup.currentStep': step,
          $addToSet: { 'setup.completedSteps': step },
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  async getSetupStatus(cityCode: string) {
    const config = await this.cityConfigModel
      .findOne({ cityCode })
      .select('setup')
      .lean()
      .exec();
    return config?.setup || null;
  }
}
