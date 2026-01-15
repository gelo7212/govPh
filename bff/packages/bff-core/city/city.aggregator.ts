import { CityServiceClient } from '../clients';
import {
  CityData,
  CreateCityRequest,
  UpdateCityRequest,
  CityResponse,
  DepartmentData,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentResponse,
  SosHQData,
  CreateSosHQRequest,
  UpdateSosHQRequest,
  SosHQResponse,
  CityConfigData,
  CreateCityConfigRequest,
  UpdateCityConfigRequest,
  CityConfigResponse,
  CityConfigIncidentRules,
  CityConfigSosRules,
  CityConfigVisibilityRules,
  CityConfigSetup,
} from '../types/city.types';

/**
 * City Aggregator - Shared orchestration layer
 * Handles city management, departments, SOS HQ, and city configurations
 * across all BFF services
 */
export class CityAggregator {
  constructor(private cityClient: CityServiceClient) {}

  // ==================== City Operations ====================

  /**
   * Get all cities with optional filtering
   */
  async getAllCities(filters?: {
    isActive?: boolean;
    provinceCode?: string;
  }): Promise<CityResponse<CityData[]>> {
    return this.cityClient.getAllCities(filters);
  }

  /**
   * Get city by city code
   */
  async getCityByCode(cityCode: string): Promise<CityResponse<CityData>> {
    return this.cityClient.getCityByCode(cityCode);
  }

  /**
   * Create a new city
   */
  async createCity(data: CreateCityRequest): Promise<CityResponse<CityData>> {
    return this.cityClient.createCity(data);
  }

  /**
   * Update city information
   */
  async updateCity(
    cityCode: string,
    data: UpdateCityRequest,
  ): Promise<CityResponse<CityData>> {
    return this.cityClient.updateCity(cityCode, data);
  }

  /**
   * Delete a city
   */
  async deleteCity(cityCode: string): Promise<CityResponse<null>> {
    return this.cityClient.deleteCity(cityCode);
  }

  /**
   * Get cities by province code
   */
  async getCitiesByProvince(
    provinceCode: string,
  ): Promise<CityResponse<CityData[]>> {
    return this.cityClient.getCitiesByProvince(provinceCode);
  }

  // ==================== Department Operations ====================

  /**
   * Get all departments with optional filtering
   */
  async getAllDepartments(filters?: {
    isActive?: boolean;
    cityCode?: string;
  }): Promise<DepartmentResponse<DepartmentData[]>> {
    return this.cityClient.getAllDepartments(filters);
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(id: string): Promise<DepartmentResponse<DepartmentData>> {
    return this.cityClient.getDepartmentById(id);
  }

  /**
   * Get departments by city code
   */
  async getDepartmentsByCity(
    cityCode: string,
    sosCapableOnly?: boolean,
  ): Promise<DepartmentResponse<DepartmentData[]>> {
    return this.cityClient.getDepartmentsByCity(cityCode, sosCapableOnly);
  }

  /**
   * Get SOS-capable departments for a city
   */
  async getSosCapableDepartments(
    cityCode: string,
  ): Promise<DepartmentResponse<DepartmentData[]>> {
    return this.cityClient.getDepartmentsByCity(cityCode, true);
  }

  /**
   * Create a new department
   */
  async createDepartment(
    data: CreateDepartmentRequest,
  ): Promise<DepartmentResponse<DepartmentData>> {
    return this.cityClient.createDepartment(data);
  }

  /**
   * Update department
   */
  async updateDepartment(
    id: string,
    data: UpdateDepartmentRequest,
  ): Promise<DepartmentResponse<DepartmentData>> {
    return this.cityClient.updateDepartment(id, data);
  }

  /**
   * Delete department
   */
  async deleteDepartment(id: string): Promise<DepartmentResponse<null>> {
    return this.cityClient.deleteDepartment(id);
  }

  /**
   * Get department by city code and department code
   */
  async getDepartmentByCode(
    cityCode: string,
    code: string,
  ): Promise<DepartmentResponse<DepartmentData>> {
    return this.cityClient.getDepartmentByCode(cityCode, code);
  }

  /**
   * Get departments handling specific incident type
   */
  async getDepartmentsByIncidentType(
    incidentType: string,
    cityCode?: string,
  ): Promise<DepartmentResponse<DepartmentData[]>> {
    return this.cityClient.getDepartmentsByIncidentType(incidentType, cityCode);
  }

  // ==================== SOS HQ Operations ====================

  /**
   * Get all SOS HQ with optional filtering
   */
  async getAllSosHQ(filters?: {
    isActive?: boolean;
    cityCode?: string;
    provinceCode?: string;
    scopeLevel?: 'CITY' | 'PROVINCE';
  }): Promise<SosHQResponse<SosHQData[]>> {
    return this.cityClient.getAllSosHQ(filters);
  }

  /**
   * Get SOS HQ by ID
   */
  async getSosHQById(id: string): Promise<SosHQResponse<SosHQData>> {
    return this.cityClient.getSosHQById(id);
  }

  /**
   * Get SOS HQ by city code
   */
  async getSosHQByCity(
    cityCode: string,
  ): Promise<SosHQResponse<SosHQData[]>> {
    return this.cityClient.getSosHQByCity(cityCode);
  }

  /**
   * Get SOS HQ by province code
   */
  async getSosHQByProvince(
    provinceCode: string,
  ): Promise<SosHQResponse<SosHQData[]>> {
    return this.cityClient.getSosHQByProvince(provinceCode);
  }

  /**
   * Get main SOS HQ for city or province
   */
  async getMainSosHQ(
    cityCode?: string,
    provinceCode?: string,
  ): Promise<SosHQResponse<SosHQData>> {
    return this.cityClient.getMainSosHQ(cityCode, provinceCode);
  }

  /**
   * Create a new SOS HQ
   */
  async createSosHQ(
    data: CreateSosHQRequest,
  ): Promise<SosHQResponse<SosHQData>> {
    return this.cityClient.createSosHQ(data);
  }

  async getSosHQByUserId(userId: string): Promise<SosHQResponse<SosHQData[]>> {
    return this.cityClient.getSosHQByUserId(userId);
  }

  /**
   * Update SOS HQ
   */
  async updateSosHQ(
    id: string,
    data: UpdateSosHQRequest,
  ): Promise<SosHQResponse<SosHQData>> {
    return this.cityClient.updateSosHQ(id, data);
  }

  /**
   * Delete SOS HQ
   */
  async deleteSosHQ(id: string): Promise<SosHQResponse<null>> {
    return this.cityClient.deleteSosHQ(id);
  }

  /**
   * Activate SOS HQ
   */
  async activateSosHQ(id: string): Promise<SosHQResponse<SosHQData>> {
    return this.cityClient.activateSosHQ(id);
  }

  /**
   * Deactivate SOS HQ
   */
  async deactivateSosHQ(id: string): Promise<SosHQResponse<SosHQData>> {
    return this.cityClient.deactivateSosHQ(id);
  }
  /**
   * Get Nearby SOS HQs based on coordinates
   */
  async getNearestSosHQ(
    latitude: number,
    longitude: number,
  ): Promise<SosHQResponse<SosHQData>> {
    return this.cityClient.getNearestSosHQ(latitude, longitude);
  }

  // ==================== City Config Operations ====================

  /**
   * Get all city configurations with optional filtering
   */
  async getAllCityConfigs(filters?: {
    isActive?: boolean;
  }): Promise<CityConfigResponse<CityConfigData[]>> {
    return this.cityClient.getAllCityConfigs(filters);
  }

  /**
   * Get city configuration by city code
   */
  async getCityConfig(
    cityCode: string,
  ): Promise<CityConfigResponse<CityConfigData>> {
    return this.cityClient.getCityConfig(cityCode);
  }

  /**
   * Create a new city configuration
   */
  async createCityConfig(
    data: CreateCityConfigRequest,
  ): Promise<CityConfigResponse<CityConfigData>> {
    return this.cityClient.createCityConfig(data);
  }

  /**
   * Update city configuration
   */
  async updateCityConfig(
    cityCode: string,
    data: UpdateCityConfigRequest,
  ): Promise<CityConfigResponse<CityConfigData>> {
    return this.cityClient.updateCityConfig(cityCode, data);
  }

  /**
   * Delete city configuration
   */
  async deleteCityConfig(cityCode: string): Promise<CityConfigResponse<null>> {
    return this.cityClient.deleteCityConfig(cityCode);
  }

  // ==================== Config Rules Operations ====================

  /**
   * Update incident-specific rules for a city
   */
  async updateIncidentRules(
    cityCode: string,
    rules: Partial<CityConfigIncidentRules>,
  ): Promise<CityConfigResponse<CityConfigData>> {
    return this.cityClient.updateIncidentRules(cityCode, rules);
  }

  /**
   * Update SOS-specific rules for a city
   */
  async updateSosRules(
    cityCode: string,
    rules: Partial<CityConfigSosRules>,
  ): Promise<CityConfigResponse<CityConfigData>> {
    return this.cityClient.updateSosRules(cityCode, rules);
  }

  /**
   * Update visibility and transparency rules for a city
   */
  async updateVisibilityRules(
    cityCode: string,
    rules: Partial<CityConfigVisibilityRules>,
  ): Promise<CityConfigResponse<CityConfigData>> {
    return this.cityClient.updateVisibilityRules(cityCode, rules);
  }

  // ==================== Setup Workflow Operations ====================

  /**
   * Initialize setup workflow for a city
   */
  async initializeSetup(
    cityCode: string,
    userId?: string,
  ): Promise<CityConfigResponse<CityConfigData>> {
    return this.cityClient.initializeSetup(cityCode, userId);
  }

  /**
   * Update current setup step
   */
  async updateSetupStep(
    cityCode: string,
    step: 'CITY_PROFILE' | 'DEPARTMENTS' | 'SOS_HQ' | 'SETTINGS' | 'COMPLETED',
  ): Promise<CityConfigResponse<CityConfigData>> {
    return this.cityClient.updateSetupStep(cityCode, step);
  }

  /**
   * Get setup status for a city
   */
  async getSetupStatus(
    cityCode: string,
  ): Promise<CityConfigResponse<CityConfigSetup>> {
    return this.cityClient.getSetupStatus(cityCode);
  }

  // ==================== Composite Operations ====================

  /**
   * Get complete city setup (city + config + departments + sos-hq)
   * Useful for city dashboard and setup workflows
   */
  async getCompleteCitySetup(cityCode: string) {
    try {
      const [cityResult, configResult, departmentsResult, sosHQResult] = await Promise.all([
        this.getCityByCode(cityCode),
        this.getCityConfig(cityCode),
        this.getDepartmentsByCity(cityCode),
        this.getSosHQByCity(cityCode),
      ]);

      return {
        success:
          cityResult.success &&
          configResult.success &&
          departmentsResult.success &&
          sosHQResult.success,
        data: {
          city: cityResult.data,
          config: configResult.data,
          departments: departmentsResult.data,
          sosHQ: sosHQResult.data,
        },
        error:
          !cityResult.success
            ? cityResult.error
            : !configResult.success
              ? configResult.error
              : !departmentsResult.success
                ? departmentsResult.error
                : sosHQResult.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Initialize city setup workflow with complete configuration
   */
  async initializeCityWithConfig(
    cityData: CreateCityRequest,
    configData: CreateCityConfigRequest,
    userId?: string,
  ) {
    try {
      // Create city first
      const cityResult = await this.createCity(cityData);
      if (!cityResult.success) {
        return cityResult;
      }

      // Create city config
      const configResult = await this.createCityConfig({
        ...configData,
        cityCode: cityData.cityCode,
        cityId: cityData.cityId,
      });
      if (!configResult.success) {
        return configResult;
      }

      // Initialize setup workflow
      const setupResult = await this.initializeSetup(
        cityData.cityCode,
        userId,
      );

      return setupResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
