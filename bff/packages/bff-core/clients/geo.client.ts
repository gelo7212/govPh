import { BaseClient } from './base.client';

/**
 * Geo Service Client
 * Shared client for communicating with the geo-service microservice
 */
export class GeoServiceClient extends BaseClient {
  constructor(baseURL: string) {
    super(baseURL);
  }

  /**
   * Get all provinces
   * GET /boundaries/provinces
   */
  async getAllProvinces() {
    try {
      const response = await this.client.get('/geo/boundaries/provinces');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get municipalities by province name
   * GET /boundaries/municipalities?province=<province_name>
   */
  async getMunicipalitiesByProvince(province: string) {
    try {
      const response = await this.client.get('/geo/boundaries/municipalities', {
        params: { province },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get barangays by municipality code
   * GET /boundaries/barangays?municipalityCode=<code>
   */
  async getBarangaysByMunicipality(municipalityCode: string) {
    try {
      const response = await this.client.get('/geo/boundaries/barangays', {
        params: { municipalityCode },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
