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
  async createSosRequest(data: CreateSosRequest){
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
   * Get all SOS requests (admin only)
   */
  async getAllSosRequests(filters?: any): Promise<SosRequest[]> {
    const requests = await this.sosClient.getAllSosRequests(filters);
    return requests;
  }

  /**
   * Update citizen location for an active SOS request
   */
  async updateLocation(sosId: string, location: any): Promise<SosRequest> {
    const updated = await this.sosClient.updateLocation(sosId, location);
    return updated;
  }

  /**
   * Send a message in an SOS conversation
   */
  async sendMessage(sosId: string, data: any): Promise<any> {
    const result = await this.sosClient.sendMessage(sosId, data);
    return result;
  }

  /**
   * Cancel SOS request
   */
  async cancelSosRequest(sosId: string): Promise<SosRequest> {
    const updated = await this.sosClient.cancelSosRequest(sosId);
    return updated;
  }

  /**
   * Close/Resolve an SOS request
   */
  async closeSosRequest(sosId: string, data: any): Promise<SosRequest> {
    const updated = await this.sosClient.closeSosRequest(sosId, data);
    return updated;
  }

  /**
   * Save location snapshot from realtime service
   */
  async saveLocationSnapshot(sosId: string, data: any): Promise<any> {
    const result = await this.sosClient.saveLocationSnapshot(sosId, data);
    return result;
  }

  /**
   * Assign rescuer to SOS request (internal dispatch endpoint)
   */
  async assignRescuer(sosId: string, rescuerId: string): Promise<SosRequest> {
    const assigned = await this.sosClient.assignRescuer(sosId, rescuerId);
    return assigned;
  }

  /**
   * Get assigned SOS for a rescuer
   */
  async getRescuerAssignment(): Promise<SosRequest> {
    const assignment = await this.sosClient.getRescuerAssignment();
    return assignment;
  }

  /**
   * Update rescuer location
   */
  async updateRescuerLocation(location: any): Promise<any> {
    const result = await this.sosClient.updateRescuerLocation(location);
    return result;
  }

  /**
   * Get active SOS request for a citizen
   */
  async getActiveSosByCitizen(citizenId: string, cityId: string){
    const result = await this.sosClient.getActiveSosByCitizen(citizenId, cityId);
    return result;
  }
  /**
   * Update SOS tag
   */
  async updateTag(sosId: string, tag: string) {
    const updated = await this.sosClient.updateTag(sosId, tag);
    return updated;
  } 
}
