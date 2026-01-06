import { SosServiceClient, RealtimeServiceClient, CityServiceClient } from '@gov-ph/bff-core';

/**
 * SOS Aggregator - Orchestrates SOS operations
 * This aggregator handles creation, retrieval, and management of SOS requests
 * Coordinates between SOS Service and Realtime Service
 */
export class SosAggregator {
  private sosClient: SosServiceClient;
  private realtimeClient: RealtimeServiceClient;
  private cityServiceClient: CityServiceClient;

  constructor(sosClient: SosServiceClient, realtimeClient: RealtimeServiceClient, cityServiceClient: CityServiceClient) {
    this.sosClient = sosClient;
    this.realtimeClient = realtimeClient || new RealtimeServiceClient();
    this.cityServiceClient = cityServiceClient || new CityServiceClient(process.env.CITY_SERVICE_URL || 'http://govph-city:3000');
  }

  /**
   * Create a new SOS request
   * 1. Creates SOS in SOS Service (database)
   * 2. Initializes realtime context in Realtime Service (Redis)
   */
  async createSosRequest(data: any) {
    // Step 1: Create SOS in database
    // Step 2: Initialize realtime context (Redis + socket rooms)
    try {

      //check if city is registered for SOS by location radius
      const city = await this.cityServiceClient.getNearestSosHQ(data.location.latitude, data.location.longitude);
      if(!city || !city.data || !city.data._id){
        throw new Error('No SOS HQ found near the provided location');
      }

      const sosResult = await this.sosClient.createSosRequest(data);
      const realtimeResult = await this.realtimeClient.initSosContext(
        sosResult.data.id,
        data.userId,
        data.location
      );
      
      return {
        ...sosResult,
        realtimeResult: realtimeResult,
        realtimeInitialized: true,
      };
    } catch (error) {
      // Log error but don't fail the SOS creation
      console.error('Failed to initialize realtime context:', error);
      if(error instanceof Error && (error.message === 'No SOS HQ found nearby' || error.message === 'No SOS HQ found near the provided location')){
        throw error;
      }
      return {
        sosResult: null,
        realtimeInitialized: false,
      };
    }
  }

  /**
   * Get SOS request by ID
   */
  async getSosRequest(sosId: string) {
    const result = await this.sosClient.getSosRequest(sosId);
    return result;
  }

  /**
   * Get all SOS requests (supports filtering by userId in filters parameter)
   */
  async getAllSosRequests(filters?: any) {
    const requests = await this.sosClient.getAllSosRequests(filters);
    return requests;
  }

  /**
   * Get active SOS request for a citizen
  */
  async getActiveSosByCitizen(citizenId: string, cityCode: string): Promise<any> {
    const result = await this.sosClient.getActiveSosByCitizen(citizenId, cityCode);
    return result;
  }

  /**
   * Update citizen location for an active SOS request
   */
  async updateLocation(sosId: string, location: any) {
    const result = await this.sosClient.updateLocation(sosId, location);
    return result;
  }

  /**
   * Send a message in an SOS conversation
   */
  async sendMessage(sosId: string, data: any) {
    const result = await this.sosClient.sendMessage(sosId, data);
    return result;
  }

  /**
   * Cancel SOS request
   */
  async cancelSosRequest(sosId: string, context: any) {
    const request = await this.sosClient.getSosRequest(sosId);
    if (!request) {
      throw new Error('SOS request not found');
    }

    const data = request.data;
    if(data.status === 'CANCELLED' || data.status === 'CLOSED') {
      throw new Error(`Cannot cancel an SOS request that is already ${data.status}`);
    }

    if(data.status === 'ACTIVE'){
      const result = await this.sosClient.cancelSosRequest(
        sosId,
        context
      );
      return result;
    } else {
      throw new Error(`Cannot cancel an SOS request with status ${data.status}`);
    }
  }

  async updateSosTag(sosId: string, tag: string) {
    const result = await this.sosClient.updateTag(sosId, tag);
    return result;
  }

  async getNearestSosHQ(latitude: number, longitude: number): Promise<any> {
    const result = await this.cityServiceClient.getNearestSosHQ(latitude, longitude);
    return result;
  }
}
