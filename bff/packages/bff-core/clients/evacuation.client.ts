import {
  EvacuationCenterData,
  CreateEvacuationCenterRequest,
  UpdateEvacuationCenterRequest,
  EvacuationCenterResponse,
  UpdateCapacityRequest,
  UpdateStatusRequest,
} from '../evacuation/evacuation.types';
import { BaseClient, UserContext } from './base.client';

/**
 * Evacuation Center Service Client
 * Manages evacuation center operations
 */
export class EvacuationCenterServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
  }

  /**
   * Get all evacuation centers with optional filtering
   * GET /api/evacuation-centers
   */
  async getAllEvacuationCenters(filters?: {
    cityId?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<EvacuationCenterResponse<EvacuationCenterData[]>> {
    try {
      const response = await this.client.get('/api/evacuation-centers', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get evacuation center by ID
   * GET /api/evacuation-centers/:id
   */
  async getEvacuationCenterById(
    id: string,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    try {
      const response = await this.client.get(`/api/evacuation-centers/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get evacuation centers by city
   * GET /api/cities/:cityId/evacuation-centers
   */
  async getEvacuationCentersByCity(
    cityId: string,
    filters?: {
      status?: string;
      isActive?: boolean;
    },
  ): Promise<EvacuationCenterResponse<EvacuationCenterData[]>> {
    try {
      const response = await this.client.get(
        `/api/cities/${cityId}/evacuation-centers`,
        {
          params: filters,
        },
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new evacuation center
   * POST /api/evacuation-centers
   */
  async createEvacuationCenter(
    data: CreateEvacuationCenterRequest,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    try {
      const response = await this.client.post('/api/evacuation-centers', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update an evacuation center
   * PUT /api/evacuation-centers/:id
   */
  async updateEvacuationCenter(
    id: string,
    data: UpdateEvacuationCenterRequest,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    try {
      const response = await this.client.put(
        `/api/evacuation-centers/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete an evacuation center
   * DELETE /api/evacuation-centers/:id
   */
  async deleteEvacuationCenter(
    id: string,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    try {
      const response = await this.client.delete(`/api/evacuation-centers/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update evacuation center status
   * PATCH /api/evacuation-centers/:id/status
   */
  async updateEvacuationCenterStatus(
    id: string,
    data: UpdateStatusRequest,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    try {
      const response = await this.client.patch(
        `/api/evacuation-centers/${id}/status`,
        data,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update evacuation center capacity
   * PATCH /api/evacuation-centers/:id/capacity
   */
  async updateEvacuationCenterCapacity(
    id: string,
    data: UpdateCapacityRequest,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    try {
      const response = await this.client.patch(
        `/api/evacuation-centers/${id}/capacity`,
        data,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
