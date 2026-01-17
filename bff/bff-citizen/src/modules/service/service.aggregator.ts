import { ServiceAggregator, ServiceServiceClient } from '@gov-ph/bff-core';

/**
 * Admin Service Aggregator - BFF Admin wrapper
 * Wraps the bff-core ServiceAggregator for admin operations
 */
export class AdminServiceAggregator {
  private aggregator: ServiceAggregator;

  constructor(baseURL: string) {
    const client = new ServiceServiceClient(baseURL);
    this.aggregator = new ServiceAggregator(client);
  }


  async getServiceById(serviceId: string) {
    return this.aggregator.getServiceById(serviceId);
  }

  async getServicesByCity(
    cityId: string,
    filters?: { isActive?: boolean; category?: string },
    limit?: number,
    skip?: number
  ) {
    return this.aggregator.getServicesByCity(cityId, filters, limit, skip);
  }


  async getServicesByCategory(cityId: string, category: string, isActive?: boolean) {
    return this.aggregator.getServicesByCategory(cityId, category, isActive);
  }

}
