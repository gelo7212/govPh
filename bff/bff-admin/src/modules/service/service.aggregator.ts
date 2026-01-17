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

  async createService(data: any) {
    return this.aggregator.createService(data);
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

  async getAllServices(
    filters?: { isActive?: boolean; category?: string; cityId?: string },
    limit?: number,
    skip?: number
  ) {
    return this.aggregator.getAllServices(filters, limit, skip);
  }

  async getServicesByCategory(cityId: string, category: string, isActive?: boolean) {
    return this.aggregator.getServicesByCategory(cityId, category, isActive);
  }

  async updateService(serviceId: string, data: any) {
    return this.aggregator.updateService(serviceId, data);
  }

  async archiveService(serviceId: string) {
    return this.aggregator.archiveService(serviceId);
  }

  async activateService(serviceId: string) {
    return this.aggregator.activateService(serviceId);
  }

  async deleteService(serviceId: string) {
    return this.aggregator.deleteService(serviceId);
  }

  async updateInfoForm(serviceId: string, formId: string, version?: number) {
    return this.aggregator.updateInfoForm(serviceId, formId, version);
  }

  async updateApplicationForm(serviceId: string, formId: string, version?: number) {
    return this.aggregator.updateApplicationForm(serviceId, formId, version);
  }

  async updateAvailability(serviceId: string, startAt?: Date, endAt?: Date) {
    return this.aggregator.updateAvailability(serviceId, startAt, endAt);
  }

  async countServicesByCity(cityId: string, filters?: { isActive?: boolean }) {
    return this.aggregator.countServicesByCity(cityId, filters);
  }
}
