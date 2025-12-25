import { GeoServiceClient } from '@gov-ph/bff-core';

/**
 * Geo Aggregator - Orchestrates geographic operations
 * This aggregator handles province, municipality, and barangay data retrieval
 */
export class GeoAggregator {
  private geoClient: GeoServiceClient;

  constructor(geoClient: GeoServiceClient) {
    this.geoClient = geoClient;
  }

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
   * Get barangays by municipality code
   */
  async getBarangaysByMunicipality(municipalityCode: string) {
    const barangays = await this.geoClient.getBarangaysByMunicipality(municipalityCode);
    return barangays;
  }
}
