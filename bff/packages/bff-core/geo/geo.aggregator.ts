import { GeoServiceClient } from '../clients';
import { Municipality, ApiResponse } from '../types';

/**
 * Geo Aggregator - Shared orchestration layer
 * Handles geographic data and boundary management across all BFF services
 */
export class GeoAggregator {
  constructor(private geoClient: GeoServiceClient) {}

  /**
   * Get all provinces
   */
  async getAllProvinces() {
    const provinces = await this.geoClient.getAllProvinces();
    return provinces;
  }

  /**
   * Get municipalities by province name
   */
  async getMunicipalitiesByProvince(province: string) {
    const municipalities = await this.geoClient.getMunicipalitiesByProvince(province);
    return municipalities;
  }

  /**
   * Get municipality by municipality code
   */
  async getMunicipalityByCode(municipalityCode: string): Promise<ApiResponse<Municipality>> {
    const response = await this.geoClient.getMunicipalityByCode(municipalityCode);
    return response;
  }

  /**
   * Get barangays by municipality code
   */
  async getBarangaysByMunicipality(municipalityCode: string) {
    const barangays = await this.geoClient.getBarangaysByMunicipality(municipalityCode);
    return barangays;
  }

  /**
 * GET /geo/reverse-geocode?lat=15.0339584&lon=120.6878208
 * Reverse geocode coordinates to address
 * Optional: zoom=18, addressDetails=true
 */
  async reverseGeocode(lat: number, lon: number, zoom?: number, addressDetails?: boolean) {
    const response = await this.geoClient.reverseGeocode(lat, lon, zoom, addressDetails);
    return response;
  }
}
