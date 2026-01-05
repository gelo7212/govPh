import { Model, mongo } from 'mongoose';
import { ICity } from './city.schema';
import { CityConfigService } from '../city-config/city-config.service';
import { ICityConfig } from '../city-config/city-config.schema';

export class CityService {
  constructor(
    private cityModel: Model<ICity>,
    private cityConfigService?: CityConfigService,
  ) {}

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
    data._id = new mongo.ObjectId(data.cityId);
    
    const city = new this.cityModel(data);
    const savedCity = await city.save();

    // Auto-create city config when city is created
    if (this.cityConfigService) {
      const defaultConfig: Partial<ICityConfig> = {
        cityCode: data.cityCode,
        cityId: (savedCity as any)._id?.toString() || '',
        incident: {
          allowAnonymous: true,
          allowOutsideCityReports: false,
          autoAssignDepartment: true,
          requireCityVerificationForResolve: false,
        },
        sos: {
          allowAnywhere: true,
          autoAssignNearestHQ: true,
          escalationMinutes: 30,
          allowProvinceFallback: true,
        },
        visibility: {
          showIncidentsOnPublicMap: true,
          showResolvedIncidents: false,
        },
        setup: {
          isInitialized: false,
          currentStep: 'CITY_PROFILE' as const,
          completedSteps: [],
        },
        isActive: true,
      };
      try {
        await this.cityConfigService.createCityConfig(defaultConfig);
      } catch (error) {
        console.error('Failed to create city config:', error);
        // Don't fail city creation if config creation fails
      }
    }

    return savedCity;
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
