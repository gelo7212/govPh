import { BaseClient, UserContext } from './base.client';

/**
 * Geo Service Client
 * Shared client for communicating with the geo-service microservice
 */
export class GeoServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
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
   * Get municipality by municipality code
   * GET /boundaries/municipalities/:municipalityCode
   */
  async getMunicipalityByCode(municipalityCode: string)  {
    try {
      const response = await this.client.get(`/geo/boundaries/municipalities/${municipalityCode}`);
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

  /**
 * GET /geo/reverse-geocode?lat=15.0339584&lon=120.6878208
 * Reverse geocode coordinates to address
 * Optional: zoom=18, addressDetails=true
 */
  async reverseGeocode(lat: number, lon: number, zoom?: number, addressDetails?: boolean) {
    try {
      const response = await this.client.get('/geo/reverse-geocode', {
        params: { lat, lon, zoom, addressDetails },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
