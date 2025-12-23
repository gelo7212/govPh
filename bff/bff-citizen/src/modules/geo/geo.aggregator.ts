import { GeoServiceClient } from '@gov-ph/bff-core';

/**
 * Geo Aggregator - Orchestrates geographic operations
 * This aggregator handles boundary searches and geographic data retrieval
 */
export class GeoAggregator {
  private geoClient: GeoServiceClient;

  constructor(geoClient: GeoServiceClient) {
    this.geoClient = geoClient;
  }

  /**
   * Get boundaries with optional filters
   */
  async getBoundaries(filters?: any) {
    const boundaries = await this.geoClient.getBoundaries(filters);
    return boundaries;
  }

  /**
   * Get boundary by ID
   */
  async getBoundaryById(boundaryId: string) {
    const boundary = await this.geoClient.getBoundaryById(boundaryId);
    return boundary;
  }

  /**
   * Search boundaries by query
   */
  async searchBoundaries(query: string) {
    const results = await this.geoClient.searchBoundaries(query);
    return results;
  }
}
