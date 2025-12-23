import { SosServiceClient } from '@gov-ph/bff-core';
/**
 * SOS Aggregator - Orchestrates SOS operations
 * This aggregator handles creation, retrieval, and management of SOS requests
 */
export class SosAggregator {
  private sosClient: SosServiceClient;

  constructor(sosClient: SosServiceClient) {
    this.sosClient = sosClient;
  }

  /**
   * Create a new SOS request
   */
  async createSosRequest(data: any) {
    const result = await this.sosClient.createSosRequest(data);
    return result;
  }

  /**
   * Get SOS request by ID
   */
  async getSosRequest(sosId: string) {
    const result = await this.sosClient.getSosRequest(sosId);
    return result;
  }

  /**
   * Get all SOS requests for a user
   */
  async getUserSosRequests(userId: string) {
    const requests = await this.sosClient.getUserSosRequests(userId);
    return requests;
  }

  /**
   * Cancel SOS request
   */
  async cancelSosRequest(sosId: string) {
    const result = await this.sosClient.cancelSosRequest(sosId);
    return result;
  }
}
