import { GeoServiceClient } from '../clients';
import { Boundary, BoundarySearchResult } from '../types';

/**
 * Geo Aggregator - Shared orchestration layer
 * Handles geographic data and boundary management across all BFF services
 */
export class GeoAggregator {
  constructor(private geoClient: GeoServiceClient) {}

  /**
   * Get boundaries with optional filters
   */
  async getBoundaries(filters?: any): Promise<Boundary[]> {
    const boundaries = await this.geoClient.getBoundaries(filters);
    return boundaries;
  }

  /**
   * Get boundary by ID
   */
  async getBoundaryById(boundaryId: string): Promise<Boundary> {
    const boundary = await this.geoClient.getBoundaryById(boundaryId);
    return boundary;
  }

  /**
   * Search boundaries by query
   */
  async searchBoundaries(query: string): Promise<BoundarySearchResult[]> {
    const results = await this.geoClient.searchBoundaries(query);
    return results;
  }

  /**
   * Create new boundary (admin only)
   */
  async createBoundary(data: Partial<Boundary>): Promise<Boundary> {
    const boundary = await this.geoClient.createBoundary(data);
    return boundary;
  }

  /**
   * Update boundary (admin only)
   */
  async updateBoundary(boundaryId: string, data: Partial<Boundary>): Promise<Boundary> {
    const updated = await this.geoClient.updateBoundary(boundaryId, data);
    return updated;
  }

  /**
   * Delete boundary (admin only)
   */
  async deleteBoundary(boundaryId: string): Promise<void> {
    await this.geoClient.deleteBoundary(boundaryId);
  }
}
