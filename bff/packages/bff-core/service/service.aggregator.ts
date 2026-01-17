import { ServiceServiceClient } from '../clients';
import {
  ServiceEntity,
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceResponse,
} from './service.types';

/**
 * Service Aggregator - Shared orchestration layer
 * Handles service management across all BFF services
 */
export class ServiceAggregator {
  constructor(private serviceClient: ServiceServiceClient) {}

  // ==================== Service Operations ====================

  /**
   * Create a new service
   */
  async createService(data: CreateServiceRequest): Promise<ServiceResponse<ServiceEntity>> {
    const result = await this.serviceClient.createService(data);
    return result;
  }

  /**
   * Get service by ID
   */
  async getServiceById(serviceId: string): Promise<ServiceResponse<ServiceEntity>> {
    const service = await this.serviceClient.getServiceById(serviceId);
    return service;
  }

  /**
   * Get all services for a specific city
   */
  async getServicesByCity(
    cityId: string,
    filters?: {
      isActive?: boolean;
      category?: string;
    },
    limit: number = 50,
    skip: number = 0
  ): Promise<ServiceResponse<ServiceEntity[]>> {
    const services = await this.serviceClient.getServicesByCity(cityId, filters, limit, skip);
    return services;
  }

  /**
   * Get all services globally with optional filtering
   */
  async getAllServices(
    filters?: {
      isActive?: boolean;
      category?: string;
      cityId?: string;
    },
    limit: number = 50,
    skip: number = 0
  ): Promise<ServiceResponse<ServiceEntity[]>> {
    const services = await this.serviceClient.getAllServices(filters, limit, skip);
    return services;
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(
    cityId: string,
    category: string,
    isActive?: boolean
  ): Promise<ServiceResponse<ServiceEntity[]>> {
    const services = await this.serviceClient.getServicesByCategory(cityId, category, isActive);
    return services;
  }

  /**
   * Update service
   */
  async updateService(
    serviceId: string,
    data: UpdateServiceRequest
  ): Promise<ServiceResponse<ServiceEntity>> {
    const result = await this.serviceClient.updateService(serviceId, data);
    return result;
  }

  /**
   * Archive service (set isActive to false)
   */
  async archiveService(serviceId: string): Promise<ServiceResponse<ServiceEntity>> {
    const result = await this.serviceClient.archiveService(serviceId);
    return result;
  }

  /**
   * Activate service (set isActive to true)
   */
  async activateService(serviceId: string): Promise<ServiceResponse<ServiceEntity>> {
    const result = await this.serviceClient.activateService(serviceId);
    return result;
  }

  /**
   * Delete service permanently
   */
  async deleteService(serviceId: string): Promise<ServiceResponse<ServiceEntity>> {
    const result = await this.serviceClient.deleteService(serviceId);
    return result;
  }

  /**
   * Update service info form
   */
  async updateInfoForm(
    serviceId: string,
    formId: string,
    version?: number
  ): Promise<ServiceResponse<ServiceEntity>> {
    const result = await this.serviceClient.updateInfoForm(serviceId, { formId, version });
    return result;
  }

  /**
   * Update service application form
   */
  async updateApplicationForm(
    serviceId: string,
    formId: string,
    version?: number
  ): Promise<ServiceResponse<ServiceEntity>> {
    const result = await this.serviceClient.updateApplicationForm(serviceId, { formId, version });
    return result;
  }

  /**
   * Update service availability
   */
  async updateAvailability(
    serviceId: string,
    startAt?: Date,
    endAt?: Date
  ): Promise<ServiceResponse<ServiceEntity>> {
    const result = await this.serviceClient.updateAvailability(serviceId, { startAt, endAt });
    return result;
  }

  /**
   * Get count of services in a city
   */
  async countServicesByCity(
    cityId: string,
    filters?: { isActive?: boolean }
  ): Promise<ServiceResponse<number>> {
    const result = await this.serviceClient.countServicesByCity(cityId, filters);
    return result;
  }
}
