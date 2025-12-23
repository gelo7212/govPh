import { SosServiceClient } from '../clients';
import { CreateSosRequest, SosRequest } from '../types';

/**
 * SOS Aggregator - Shared orchestration layer
 * Handles SOS request management across all BFF services
 */
export class SosAggregator {
  constructor(private sosClient: SosServiceClient) {}

  /**
   * Create a new SOS request
   */
  async createSosRequest(data: CreateSosRequest): Promise<SosRequest> {
    const result = await this.sosClient.createSosRequest(data);
    return result;
  }

  /**
   * Get SOS request by ID
   */
  async getSosRequest(sosId: string): Promise<SosRequest> {
    const request = await this.sosClient.getSosRequest(sosId);
    return request;
  }

  /**
   * Get all SOS requests for a specific user
   */
  async getUserSosRequests(userId: string): Promise<SosRequest[]> {
    const requests = await this.sosClient.getSosRequestsByUser(userId);
    return requests;
  }

  /**
   * Get all SOS requests (admin only)
   */
  async getAllSosRequests(filters?: any): Promise<SosRequest[]> {
    const requests = await this.sosClient.getAllSosRequests(filters);
    return requests;
  }

  /**
   * Update SOS request
   */
  async updateSosRequest(sosId: string, data: Partial<SosRequest>): Promise<SosRequest> {
    const updated = await this.sosClient.updateSosRequest(sosId, data);
    return updated;
  }

  /**
   * Update SOS request status
   */
  async updateSosStatus(sosId: string, status: string): Promise<SosRequest> {
    const updated = await this.sosClient.updateSosStatus(sosId, status);
    return updated;
  }

  /**
   * Cancel SOS request
   */
  async cancelSosRequest(sosId: string): Promise<SosRequest> {
    const updated = await this.sosClient.cancelSosRequest(sosId);
    return updated;
  }

  /**
   * Assign rescuer to SOS request (admin/dispatch only)
   */
  async assignRescuer(sosId: string, rescuerId: string): Promise<SosRequest> {
    const assigned = await this.sosClient.assignRescuer(sosId, rescuerId);
    return assigned;
  }

  /**
   * Track SOS request location and status
   */
  async trackSosRequest(sosId: string): Promise<any> {
    const tracking = await this.sosClient.trackSosRequest(sosId);
    return tracking;
  }
}
