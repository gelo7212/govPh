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

  // Cities
  async getAllCities(filters?: { isActive?: boolean; provinceCode?: string }) {
    return this.aggregator.getAllCities(filters);
  }

  async getCityByCode(cityCode: string) {
    return this.aggregator.getCityByCode(cityCode);
  }

  async createCity(data: any) {
    return this.aggregator.createCity(data);
  }

  async updateCity(cityCode: string, data: any) {
    return this.aggregator.updateCity(cityCode, data);
  }

  async deleteCity(cityCode: string) {
    return this.aggregator.deleteCity(cityCode);
  }

  async getCitiesByProvince(provinceCode: string) {
    return this.aggregator.getCitiesByProvince(provinceCode);
  }

  // Departments
  async getAllDepartments(filters?: { isActive?: boolean; cityCode?: string }) {
    return this.aggregator.getAllDepartments(filters);
  }

  async getDepartmentById(id: string) {
    return this.aggregator.getDepartmentById(id);
  }

  async getDepartmentsByCity(cityCode: string, sosCapableOnly?: boolean) {
    return this.aggregator.getDepartmentsByCity(cityCode, sosCapableOnly);
  }

  async getSosCapableDepartments(cityCode: string) {
    return this.aggregator.getSosCapableDepartments(cityCode);
  }

  async createDepartment(data: any) {
    return this.aggregator.createDepartment(data);
  }

  async updateDepartment(id: string, data: any) {
    return this.aggregator.updateDepartment(id, data);
  }

  async deleteDepartment(id: string) {
    return this.aggregator.deleteDepartment(id);
  }

  async getDepartmentByCode(cityCode: string, code: string) {
    return this.aggregator.getDepartmentByCode(cityCode, code);
  }

  async getDepartmentsByIncidentType(incidentType: string, cityCode?: string) {
    return this.aggregator.getDepartmentsByIncidentType(incidentType, cityCode);
  }

  // SOS HQ
  async getAllSosHQ(filters?: {
    isActive?: boolean;
    cityCode?: string;
    provinceCode?: string;
    scopeLevel?: 'CITY' | 'PROVINCE';
  }) {
    return this.aggregator.getAllSosHQ(filters);
  }

  async getSosHQById(id: string) {
    return this.aggregator.getSosHQById(id);
  }

  async getSosHQByCity(cityCode: string) {
    return this.aggregator.getSosHQByCity(cityCode);
  }

  async getSosHQByProvince(provinceCode: string) {
    return this.aggregator.getSosHQByProvince(provinceCode);
  }

  async getMainSosHQ(cityCode?: string, provinceCode?: string) {
    return this.aggregator.getMainSosHQ(cityCode, provinceCode);
  }

  async createSosHQ(data: any) {
    return this.aggregator.createSosHQ(data);
  }

  async updateSosHQ(id: string, data: any) {
    return this.aggregator.updateSosHQ(id, data);
  }

  async deleteSosHQ(id: string) {
    return this.aggregator.deleteSosHQ(id);
  }

  async activateSosHQ(id: string) {
    return this.aggregator.activateSosHQ(id);
  }

  async deactivateSosHQ(id: string) {
    return this.aggregator.deactivateSosHQ(id);
  }

  // City Config
  async getAllCityConfigs(filters?: { isActive?: boolean }) {
    return this.aggregator.getAllCityConfigs(filters);
  }

  async getCityConfig(cityCode: string) {
    return this.aggregator.getCityConfig(cityCode);
  }

  async createCityConfig(data: any) {
    return this.aggregator.createCityConfig(data);
  }

  async updateCityConfig(cityCode: string, data: any) {
    return this.aggregator.updateCityConfig(cityCode, data);
  }

  async deleteCityConfig(cityCode: string) {
    return this.aggregator.deleteCityConfig(cityCode);
  }

  // Config Rules
  async updateIncidentRules(cityCode: string, rules: any) {
    return this.aggregator.updateIncidentRules(cityCode, rules);
  }

  async updateSosRules(cityCode: string, rules: any) {
    return this.aggregator.updateSosRules(cityCode, rules);
  }

  async updateVisibilityRules(cityCode: string, rules: any) {
    return this.aggregator.updateVisibilityRules(cityCode, rules);
  }

  // Setup Workflow
  async initializeSetup(cityCode: string, userId?: string) {
    return this.aggregator.initializeSetup(cityCode, userId);
  }

  async updateSetupStep(cityCode: string, step: 'CITY_PROFILE' | 'DEPARTMENTS' | 'SOS_HQ' | 'SETTINGS' | 'COMPLETED') {
    return this.aggregator.updateSetupStep(cityCode, step);
  }

  async getSetupStatus(cityCode: string) {
    return this.aggregator.getSetupStatus(cityCode);
  }

  // Composite Operations
  async getCompleteCitySetup(cityCode: string) {
    return this.aggregator.getCompleteCitySetup(cityCode);
  }

  async initializeCityWithConfig(cityData: any, configData: any, userId?: string) {
    return this.aggregator.initializeCityWithConfig(cityData, configData, userId);
  }
}
