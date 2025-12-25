import { GeoServiceClient } from '../clients';

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
   * Get barangays by municipality code
   */
  async getBarangaysByMunicipality(municipalityCode: string) {
    const barangays = await this.geoClient.getBarangaysByMunicipality(municipalityCode);
    return barangays;
  }
}
