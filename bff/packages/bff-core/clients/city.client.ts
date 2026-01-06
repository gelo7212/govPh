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
import { BaseClient, UserContext } from './base.client';

/**
 * City Service Client
 * Manages cities, departments, SOS headquarters, and city configurations
 */
export class CityServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
  }

  // ==================== Cities ====================

  /**
   * Get all cities with optional filtering
   * GET /api/cities?isActive=true&provinceCode=xxx
   */
  async getAllCities(filters?: {
    isActive?: boolean;
    provinceCode?: string;
  }): Promise<CityResponse<CityData[]>> {
    try {
      const response = await this.client.get('/api/cities', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get city by city code
   * GET /api/cities/:cityCode
   */
  async getCityByCode(cityCode: string): Promise<CityResponse<CityData>> {
    try {
      const response = await this.client.get(`/api/cities/${cityCode}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new city
   * POST /api/cities
   */
  async createCity(data: CreateCityRequest): Promise<CityResponse<CityData>> {
    try {
      const response = await this.client.post('/api/cities', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update city information
   * PUT /api/cities/:cityCode
   */
  async updateCity(
    cityCode: string,
    data: UpdateCityRequest,
  ): Promise<CityResponse<CityData>> {
    try {
      const response = await this.client.put(`/api/cities/${cityCode}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a city
   * DELETE /api/cities/:cityCode
   */
  async deleteCity(cityCode: string): Promise<CityResponse<null>> {
    try {
      const response = await this.client.delete(`/api/cities/${cityCode}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get cities by province code
   * GET /api/cities?provinceCode=xxx
   */
  async getCitiesByProvince(
    provinceCode: string,
  ): Promise<CityResponse<CityData[]>> {
    try {
      const response = await this.client.get('/api/cities', {
        params: { provinceCode },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Departments ====================

  /**
   * Get all departments with optional filtering
   * GET /api/departments?isActive=true&cityCode=xxx
   */
  async getAllDepartments(filters?: {
    isActive?: boolean;
    cityCode?: string;
  }): Promise<DepartmentResponse<DepartmentData[]>> {
    try {
      const response = await this.client.get('/api/departments', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get department by ID
   * GET /api/departments/:id
   */
  async getDepartmentById(id: string): Promise<DepartmentResponse<DepartmentData>> {
    try {
      const response = await this.client.get(`/api/departments/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get departments by city code
   * GET /api/cities/:cityCode/departments
   * Optional: sosCapable=true
   */
  async getDepartmentsByCity(
    cityCode: string,
    sosCapableOnly?: boolean,
  ): Promise<DepartmentResponse<DepartmentData[]>> {
    try {
      const response = await this.client.get(
        `/api/cities/${cityCode}/departments`,
        {
          params: sosCapableOnly ? { sosCapable: 'true' } : undefined,
        },
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new department
   * POST /api/departments
   */
  async createDepartment(
    data: CreateDepartmentRequest,
  ): Promise<DepartmentResponse<DepartmentData>> {
    try {
      const response = await this.client.post('/api/departments', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update department
   * PUT /api/departments/:id
   */
  async updateDepartment(
    id: string,
    data: UpdateDepartmentRequest,
  ): Promise<DepartmentResponse<DepartmentData>> {
    try {
      const response = await this.client.put(`/api/departments/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete department
   * DELETE /api/departments/:id
   */
  async deleteDepartment(id: string): Promise<DepartmentResponse<null>> {
    try {
      const response = await this.client.delete(`/api/departments/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get department by city code and department code
   * GET /api/departments?cityCode=xxx&code=yyy
   */
  async getDepartmentByCode(
    cityCode: string,
    code: string,
  ): Promise<DepartmentResponse<DepartmentData>> {
    try {
      const response = await this.client.get('/api/departments', {
        params: { cityCode, code },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get departments by incident type
   * GET /api/departments?incidentType=xxx&cityCode=yyy
   */
  async getDepartmentsByIncidentType(
    incidentType: string,
    cityCode?: string,
  ): Promise<DepartmentResponse<DepartmentData[]>> {
    try {
      const response = await this.client.get('/api/departments', {
        params: { incidentType, cityCode },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== SOS HQ ====================

  /**
   * Get all SOS HQ with optional filtering
   * GET /api/sos-hq?isActive=true&cityCode=xxx&provinceCode=xxx&scopeLevel=CITY
   */
  async getAllSosHQ(filters?: {
    isActive?: boolean;
    cityCode?: string;
    provinceCode?: string;
    scopeLevel?: 'CITY' | 'PROVINCE';
  }): Promise<SosHQResponse<SosHQData[]>> {
    try {
      const response = await this.client.get('/api/sos-hq', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get SOS HQ by ID
   * GET /api/sos-hq/:id
   */
  async getSosHQById(id: string): Promise<SosHQResponse<SosHQData>> {
    try {
      const response = await this.client.get(`/api/sos-hq/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get SOS HQ by city code
   * GET /api/cities/:cityCode/sos-hq
   */
  async getSosHQByCity(
    cityCode: string,
  ): Promise<SosHQResponse<SosHQData[]>> {
    try {
      const response = await this.client.get(
        `/api/cities/${cityCode}/sos-hq`,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get SOS HQ by province code
   * GET /api/sos-hq?provinceCode=xxx
   */
  async getSosHQByProvince(
    provinceCode: string,
  ): Promise<SosHQResponse<SosHQData[]>> {
    try {
      const response = await this.client.get('/api/sos-hq', {
        params: { provinceCode, scopeLevel: 'PROVINCE' },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get main SOS HQ for city or province
   * GET /api/sos-hq?isMain=true&cityCode=xxx|provinceCode=xxx
   */
  async getMainSosHQ(
    cityCode?: string,
    provinceCode?: string,
  ): Promise<SosHQResponse<SosHQData>> {
    try {
      const response = await this.client.get('/api/sos-hq', {
        params: {
          isMain: true,
          ...(cityCode && { cityCode }),
          ...(provinceCode && { provinceCode }),
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new SOS HQ
   * POST /api/sos-hq
   */
  async createSosHQ(
    data: CreateSosHQRequest,
  ): Promise<SosHQResponse<SosHQData>> {
    try {
      const response = await this.client.post('/api/sos-hq', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update SOS HQ
   * PUT /api/sos-hq/:id
   */
  async updateSosHQ(
    id: string,
    data: UpdateSosHQRequest,
  ): Promise<SosHQResponse<SosHQData>> {
    try {
      const response = await this.client.put(`/api/sos-hq/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete SOS HQ
   * DELETE /api/sos-hq/:id
   */
  async deleteSosHQ(id: string): Promise<SosHQResponse<null>> {
    try {
      const response = await this.client.delete(`/api/sos-hq/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Activate SOS HQ
   * PATCH /api/sos-hq/:id/activate
   */
  async activateSosHQ(id: string): Promise<SosHQResponse<SosHQData>> {
    try {
      const response = await this.client.patch(`/api/sos-hq/${id}/activate`, {});
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Deactivate SOS HQ
   * PATCH /api/sos-hq/:id/deactivate
   */
  async deactivateSosHQ(id: string): Promise<SosHQResponse<SosHQData>> {
    try {
      const response = await this.client.patch(
        `/api/sos-hq/${id}/deactivate`,
        {},
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get nearest SOS HQs based on coordinates
   * GET /api/sos-hq/nearest?lat=xxx&lng=yyy
   */
  async getNearestSosHQ(
    lat: number,
    lng: number,
  ): Promise<SosHQResponse<SosHQData>> {
    try {
      const response = await this.client.get('/api/sos-hq/nearest/location', {
        params: { lat, lng },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== City Config ====================

  /**
   * Get all city configurations with optional filtering
   * GET /api/city-configs?isActive=true
   */
  async getAllCityConfigs(filters?: {
    isActive?: boolean;
  }): Promise<CityConfigResponse<CityConfigData[]>> {
    try {
      const response = await this.client.get('/api/city-configs', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get city configuration by city code
   * GET /api/city-configs/:cityCode
   */
  async getCityConfig(
    cityCode: string,
  ): Promise<CityConfigResponse<CityConfigData>> {
    try {
      const response = await this.client.get(`/api/city-configs/${cityCode}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new city configuration
   * POST /api/city-configs
   */
  async createCityConfig(
    data: CreateCityConfigRequest,
  ): Promise<CityConfigResponse<CityConfigData>> {
    try {
      const response = await this.client.post('/api/city-configs', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update city configuration
   * PUT /api/city-configs/:cityCode
   */
  async updateCityConfig(
    cityCode: string,
    data: UpdateCityConfigRequest,
  ): Promise<CityConfigResponse<CityConfigData>> {
    try {
      const response = await this.client.put(
        `/api/city-configs/${cityCode}`,
        data,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete city configuration
   * DELETE /api/city-configs/:cityCode
   */
  async deleteCityConfig(cityCode: string): Promise<CityConfigResponse<null>> {
    try {
      const response = await this.client.delete(
        `/api/city-configs/${cityCode}`,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update incident rules for city configuration
   * PATCH /api/city-configs/:cityCode/incident-rules
   */
  async updateIncidentRules(
    cityCode: string,
    rules: Partial<CityConfigIncidentRules>,
  ): Promise<CityConfigResponse<CityConfigData>> {
    try {
      const response = await this.client.patch(
        `/api/city-configs/${cityCode}/incident-rules`,
        rules,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update SOS rules for city configuration
   * PATCH /api/city-configs/:cityCode/sos-rules
   */
  async updateSosRules(
    cityCode: string,
    rules: Partial<CityConfigSosRules>,
  ): Promise<CityConfigResponse<CityConfigData>> {
    try {
      const response = await this.client.patch(
        `/api/city-configs/${cityCode}/sos-rules`,
        rules,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update visibility rules for city configuration
   * PATCH /api/city-configs/:cityCode/visibility-rules
   */
  async updateVisibilityRules(
    cityCode: string,
    rules: Partial<CityConfigVisibilityRules>,
  ): Promise<CityConfigResponse<CityConfigData>> {
    try {
      const response = await this.client.patch(
        `/api/city-configs/${cityCode}/visibility-rules`,
        rules,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Initialize setup workflow for city
   * POST /api/city-configs/:cityCode/setup/initialize
   */
  async initializeSetup(
    cityCode: string,
    userId?: string,
  ): Promise<CityConfigResponse<CityConfigData>> {
    try {
      const response = await this.client.post(
        `/api/city-configs/${cityCode}/setup/initialize`,
        { userId },
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update setup step
   * PATCH /api/city-configs/:cityCode/setup/step
   */
  async updateSetupStep(
    cityCode: string,
    step: 'CITY_PROFILE' | 'DEPARTMENTS' | 'SOS_HQ' | 'SETTINGS' | 'COMPLETED',
  ): Promise<CityConfigResponse<CityConfigData>> {
    try {
      const response = await this.client.patch(
        `/api/city-configs/${cityCode}/setup/step`,
        { step },
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get setup status
   * GET /api/city-configs/:cityCode/setup/status
   */
  async getSetupStatus(
    cityCode: string,
  ): Promise<CityConfigResponse<CityConfigSetup>> {
    try {
      const response = await this.client.get(
        `/api/city-configs/${cityCode}/setup/status`,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
