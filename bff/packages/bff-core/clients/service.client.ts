import { ServiceEntity, ServiceResponse, CreateServiceRequest, UpdateServiceRequest } from '../service/service.types';
import { BaseClient, UserContext } from './base.client';

/**
 * Service Client
 * Shared client for communicating with the city-service microservice (service endpoints)
 */
export class ServiceServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
  }

  // ==================== Service Endpoints ====================

  /**
   * Create a new service
   * POST /api/services
   */
  async createService(data: CreateServiceRequest): Promise<ServiceResponse<ServiceEntity>> {
    try {
      const response = await this.client.post('/api/services', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get service by ID
   * GET /api/services/:serviceId
   */
  async getServiceById(serviceId: string): Promise<ServiceResponse<ServiceEntity>> {
    try {
      const response = await this.client.get(`/api/services/${serviceId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all services for a specific city
   * GET /api/services/city/:cityId?isActive=true&category=health
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
    try {
      const params: any = { limit, skip };
      if (filters?.isActive !== undefined) params.isActive = filters.isActive;
      if (filters?.category) params.category = filters.category;

      const response = await this.client.get(`/api/services/city/${cityId}`, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all services globally with optional filtering
   * GET /api/services?isActive=true&category=health&cityId=xxx
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
    try {
      const params: any = { limit, skip };
      if (filters?.isActive !== undefined) params.isActive = filters.isActive;
      if (filters?.category) params.category = filters.category;
      if (filters?.cityId) params.cityId = filters.cityId;

      const response = await this.client.get('/api/services', { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get services by category
   * GET /api/services/category/:category?cityId=xxx&isActive=true
   */
  async getServicesByCategory(
    cityId: string,
    category: string,
    isActive?: boolean
  ): Promise<ServiceResponse<ServiceEntity[]>> {
    try {
      const params: any = { cityId };
      if (isActive !== undefined) params.isActive = isActive;

      const response = await this.client.get(`/api/services/category/${category}`, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update service
   * PUT /api/services/:serviceId
   */
  async updateService(
    serviceId: string,
    data: UpdateServiceRequest
  ): Promise<ServiceResponse<ServiceEntity>> {
    try {
      const response = await this.client.put(`/api/services/${serviceId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Archive service (soft delete)
   * PATCH /api/services/:serviceId/archive
   */
  async archiveService(serviceId: string): Promise<ServiceResponse<ServiceEntity>> {
    try {
      const response = await this.client.patch(`/api/services/${serviceId}/archive`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Activate service
   * PATCH /api/services/:serviceId/activate
   */
  async activateService(serviceId: string): Promise<ServiceResponse<ServiceEntity>> {
    try {
      const response = await this.client.patch(`/api/services/${serviceId}/activate`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete service permanently
   * DELETE /api/services/:serviceId
   */
  async deleteService(serviceId: string): Promise<ServiceResponse<ServiceEntity>> {
    try {
      const response = await this.client.delete(`/api/services/${serviceId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update service info form
   * PATCH /api/services/:serviceId/info-form
   */
  async updateInfoForm(
    serviceId: string,
    formData: { formId: string; version?: number }
  ): Promise<ServiceResponse<ServiceEntity>> {
    try {
      const response = await this.client.patch(`/api/services/${serviceId}/info-form`, formData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update service application form
   * PATCH /api/services/:serviceId/application-form
   */
  async updateApplicationForm(
    serviceId: string,
    formData: { formId: string; version?: number }
  ): Promise<ServiceResponse<ServiceEntity>> {
    try {
      const response = await this.client.patch(`/api/services/${serviceId}/application-form`, formData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update service availability
   * PATCH /api/services/:serviceId/availability
   */
  async updateAvailability(
    serviceId: string,
    availability: { startAt?: Date; endAt?: Date }
  ): Promise<ServiceResponse<ServiceEntity>> {
    try {
      const response = await this.client.patch(`/api/services/${serviceId}/availability`, availability);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get count of services in a city
   * GET /api/services/count?cityId=xxx&isActive=true
   */
  async countServicesByCity(
    cityId: string,
    filters?: { isActive?: boolean }
  ): Promise<ServiceResponse<number>> {
    try {
      const params: any = { cityId };
      if (filters?.isActive !== undefined) params.isActive = filters.isActive;

      const response = await this.client.get('/api/services/count', { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
