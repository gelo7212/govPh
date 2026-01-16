import {
  EvacuationCenterAggregator,
  EvacuationCenterServiceClient,
} from '@gov-ph/bff-core';

/**
 * Admin Evacuation Center Aggregator - BFF Admin wrapper
 * Wraps the bff-core EvacuationCenterAggregator for admin operations
 */
export class AdminEvacuationCenterAggregator {
  private aggregator: EvacuationCenterAggregator;

  constructor(baseURL: string) {
    const client = new EvacuationCenterServiceClient(baseURL);
    this.aggregator = new EvacuationCenterAggregator(client);
  }

  async getAllEvacuationCenters(filters?: {
    cityId?: string;
    status?: string;
    isActive?: boolean;
  }) {
    return this.aggregator.getAllEvacuationCenters(filters);
  }

  async getEvacuationCenterById(id: string) {
    return this.aggregator.getEvacuationCenterById(id);
  }

  async getEvacuationCentersByCity(
    cityId: string,
    filters?: {
      status?: string;
      isActive?: boolean;
    },
  ) {
    return this.aggregator.getEvacuationCentersByCity(cityId, filters);
  }

  async getOpenEvacuationCentersByCity(cityId: string) {
    return this.aggregator.getOpenEvacuationCentersByCity(cityId);
  }

  async getAvailableEvacuationCentersByCity(cityId: string) {
    return this.aggregator.getAvailableEvacuationCentersByCity(cityId);
  }

  async getAvailableCapacity(id: string) {
    return this.aggregator.getAvailableCapacity(id);
  }
}
