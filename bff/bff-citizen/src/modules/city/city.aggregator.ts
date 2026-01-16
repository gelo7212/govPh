import { CityAggregator, CityServiceClient, GeoAggregator, GeoServiceClient } from '@gov-ph/bff-core';

/**
 * Admin City Aggregator - BFF Admin wrapper
 * Wraps the bff-core CityAggregator for admin operations
 */
export class AdminCityAggregator {
  private aggregator: CityAggregator;

  constructor(baseURL: string) {
    const client = new CityServiceClient(baseURL);
    this.aggregator = new CityAggregator(client);
  }  

  async getAllCities(filters?: { isActive?: boolean; provinceCode?: string }) {
    return this.aggregator.getAllCities(filters);
  }

  async getCityByCode(cityCode: string) {
    return this.aggregator.getCityByCode(cityCode);
  }
  async getDepartmentById(id: string) {
    return this.aggregator.getDepartmentById(id);
  }

  async getDepartmentsByCity(cityCode: string, sosCapableOnly?: boolean) {
    return this.aggregator.getDepartmentsByCity(cityCode, sosCapableOnly);
  }


  async getSosHQById(id: string) {
    return this.aggregator.getSosHQById(id);
  }

  async getSosHQByCity(cityCode: string) {
    return this.aggregator.getSosHQByCity(cityCode);
  }

}
