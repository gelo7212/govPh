import { EvacuationCenterServiceClient } from '../clients';
import {
  EvacuationCenterData,
  CreateEvacuationCenterRequest,
  UpdateEvacuationCenterRequest,
  EvacuationCenterResponse,
  UpdateCapacityRequest,
  UpdateStatusRequest,
} from '../evacuation/evacuation.types';

/**
 * Evacuation Center Aggregator - Shared orchestration layer
 * Handles evacuation center management across all BFF services
 */
export class EvacuationCenterAggregator {
  constructor(private evacuationCenterClient: EvacuationCenterServiceClient) {}

  /**
   * Get all evacuation centers with optional filtering
   */
  async getAllEvacuationCenters(filters?: {
    cityId?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<EvacuationCenterResponse<EvacuationCenterData[]>> {
    return this.evacuationCenterClient.getAllEvacuationCenters(filters);
  }

  /**
   * Get evacuation center by ID
   */
  async getEvacuationCenterById(
    id: string,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    return this.evacuationCenterClient.getEvacuationCenterById(id);
  }

  /**
   * Get evacuation centers for a specific city
   */
  async getEvacuationCentersByCity(
    cityId: string,
    filters?: {
      status?: string;
      isActive?: boolean;
    },
  ): Promise<EvacuationCenterResponse<EvacuationCenterData[]>> {
    return this.evacuationCenterClient.getEvacuationCentersByCity(
      cityId,
      filters,
    );
  }

  /**
   * Create a new evacuation center
   */
  async createEvacuationCenter(
    data: CreateEvacuationCenterRequest,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    return this.evacuationCenterClient.createEvacuationCenter(data);
  }

  /**
   * Update evacuation center information
   */
  async updateEvacuationCenter(
    id: string,
    data: UpdateEvacuationCenterRequest,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    return this.evacuationCenterClient.updateEvacuationCenter(id, data);
  }

  /**
   * Delete an evacuation center
   */
  async deleteEvacuationCenter(
    id: string,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    return this.evacuationCenterClient.deleteEvacuationCenter(id);
  }

  /**
   * Update evacuation center status
   */
  async updateEvacuationCenterStatus(
    id: string,
    status: 'OPEN' | 'FULL' | 'CLOSED' | 'STANDBY',
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    return this.evacuationCenterClient.updateEvacuationCenterStatus(id, {
      status,
    });
  }

  /**
   * Update evacuation center capacity
   */
  async updateEvacuationCenterCapacity(
    id: string,
    data: UpdateCapacityRequest,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData>> {
    return this.evacuationCenterClient.updateEvacuationCenterCapacity(id, data);
  }

  /**
   * Get open evacuation centers in a city
   */
  async getOpenEvacuationCentersByCity(
    cityId: string,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData[]>> {
    return this.getEvacuationCentersByCity(cityId, { status: 'OPEN' });
  }

  /**
   * Get available evacuation centers (OPEN status) in a city
   */
  async getAvailableEvacuationCentersByCity(
    cityId: string,
  ): Promise<EvacuationCenterResponse<EvacuationCenterData[]>> {
    const response = await this.getEvacuationCentersByCity(cityId, {
      status: 'OPEN',
      isActive: true,
    });

    if (!response.success || !response.data) {
      return response;
    }

    // Filter for centers with available capacity
    const availableCenters = response.data.filter(
      (center) => center.capacity.currentIndividuals < center.capacity.maxIndividuals,
    );

    return {
      success: true,
      data: availableCenters,
      count: availableCenters.length,
    };
  }

  /**
   * Calculate available spots in an evacuation center
   */
  async getAvailableCapacity(
    id: string,
  ): Promise<{ available: number; percentage: number; success: boolean; error?: string }> {
    const response = await this.getEvacuationCenterById(id);

    if (!response.success || !response.data) {
      return {
        success: false,
        available: 0,
        percentage: 0,
        error: response.error || 'Evacuation center not found',
      };
    }

    const { capacity } = response.data;
    const available = capacity.maxIndividuals - capacity.currentIndividuals;
    const percentage = (capacity.currentIndividuals / capacity.maxIndividuals) * 100;

    return {
      success: true,
      available,
      percentage: Math.round(percentage),
    };
  }
}
