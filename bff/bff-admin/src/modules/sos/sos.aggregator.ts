import { SosServiceClient, RealtimeServiceClient } from '@gov-ph/bff-core';

/**
 * SOS Aggregator - Orchestrates SOS operations
 * This aggregator handles creation, retrieval, and management of SOS requests
 * Coordinates between SOS Service and Realtime Service
 */
export class SosAggregator {
  private sosClient: SosServiceClient;
  private realtimeClient: RealtimeServiceClient;

  constructor(sosClient: SosServiceClient, realtimeClient?: RealtimeServiceClient) {
    this.sosClient = sosClient;
    this.realtimeClient = realtimeClient || new RealtimeServiceClient();
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
   * Supports advanced filtering, searching, and sorting
   * @param options - Configuration:
   *   - cityId: string (REQUIRED - AND condition)
   *   - filters: { date?, type?, status?, soNo?, citizenId? } (OR logic)
   *   - search: string (AND with filters)
   *   - sort: { field: 'createdAt' | 'type' | 'status', order: 'asc' | 'desc' }
   */
  async getAllSosRequests(options?: any, context?:any) {
    const requests = await this.sosClient.getAllSosRequests(options, context);
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
   * Send a message in an SOS conversation
   */
  async sendMessage(sosId: string, data: any) {
    const result = await this.sosClient.sendMessage(sosId, data);
    return result;
  }

  /**
   * Close SOS request
   */
  async closeSosRequest(sosId: string, context: any, resolutionNote?: string, status?: string): Promise<any> {
    const request = await this.sosClient.getSosRequest(sosId);
    if (!request) {
      throw new Error('SOS request not found');
    }

    const data = request.data;

    // Define allowed transitions using object mapping: current status -> allowed target statuses
    const allowedTransitions: Record<string, { allowedStatuses: string[]; errorMessage: string }> = {
      'ACTIVE': {
        allowedStatuses: ['CANCELLED', 'CLOSED', 'RESOLVED', 'REJECTED', 'FAKE'],
        errorMessage: 'Cannot transition from ACTIVE to'
      },
      'EN_ROUTE': {
        allowedStatuses: ['CLOSED', 'RESOLVED', 'FAKE'],
        errorMessage: 'Cannot transition from EN_ROUTE to'
      },
      'ARRIVED': {
        allowedStatuses: ['CLOSED', 'RESOLVED', 'FAKE'],
        errorMessage: 'Cannot transition from ARRIVED to'
      },
      'CANCELLED': {
        allowedStatuses: [],
        errorMessage: 'Cannot transition from CANCELLED to'
      },
      'CLOSED': {
        allowedStatuses: [],
        errorMessage: 'Cannot transition from CLOSED to'
      },
      'RESOLVED': {
        allowedStatuses: ['RESOLVED'],
        errorMessage: 'Cannot transition from RESOLVED to'
      },
      'REJECTED': {
        allowedStatuses: [],
        errorMessage: 'Cannot transition from REJECTED to'
      },
      'FAKE': {
        allowedStatuses: [],
        errorMessage: 'Cannot transition from FAKE to'
      }
    };

    if (!status) {
      throw new Error('Status is required');
    }

    const currentConfig = allowedTransitions[data.status];
    if (!currentConfig) {
      throw new Error(`Unknown current status: ${data.status}`);
    }

    // Check if target status is allowed from current status
    if (!currentConfig.allowedStatuses.includes(status)) {
      throw new Error(`${currentConfig.errorMessage} ${status}`);
    }

    // Proceed with close
    const result = await this.sosClient.closeSosRequest(
      sosId,
      { resolutionNote, status },
      context
    );
    return result;
  }

  async updateSosTag(sosId: string, tag: string) {
    const result = await this.sosClient.updateTag(sosId, tag);
    return result;
  }

  async getNearbySOSStates(lat: number, lon: number, radiusMeters: number): Promise<any> {
    const result = await this.realtimeClient.getSOSNearbyLocation(lat, lon, radiusMeters);
    return result;
  }

  async createAnonRescuer(sosId: string, requestMissionId: string, cityCode: string, context: any): Promise<any> {
    const result = await this.sosClient.createAnonRescuer(sosId, requestMissionId, cityCode, context);
    return result;
  }
  async getSosState(sosId: string): Promise<any> {
    const state = await this.realtimeClient.getSosState(sosId);
    return state;
  }

  async dispatchRescue(sosData: any, context: any): Promise<any> {
    const  {
        sosId,
        rescuerId,
        departmentId, 
        departmentName
    } = sosData;
    const result = await this.sosClient.dispatchRescue(sosId, rescuerId, departmentId, departmentName, context);
    return result;
  }

  async getRescuerAssignment(context: any): Promise<any> {
    const result = await this.sosClient.getRescuerAssignment(context);
    return result;
  }

  async updateRescuerLocation(sosId: string, rescuerId: string, latitude: number, longitude: number, accuracy?: number): Promise<any> {
    console.log('Updating rescuer location:', { sosId, rescuerId, latitude, longitude, accuracy });
    const sos = await this.sosClient.getSosRequest(sosId);
    if (!sos) {
      throw new Error('SOS request not found');
    }
    if(sos.data.status === 'CLOSED' || 
      sos.data.status === 'CANCELLED' || 
      sos.data.status === 'COMPLETED' ||
      sos.data.status === 'RESOLVED' ||
      sos.data.status === 'REJECTED' ||
      sos.data.status === 'FAKE' 
    ){
      throw new Error('Cannot update location for completed SOS');
    }
   
    const result = await this.realtimeClient.upsertRescuerLocation(sosId, rescuerId, latitude, longitude, accuracy);
    return result;
  }

  async getRescuerLocation(sosId: string, rescuerId: string): Promise<any> {
    const result = await this.realtimeClient.getRescuerLocation(sosId, rescuerId);
    return result;
  }

  async getRescuerListByCity(municipalityCode: string, context:any): Promise<any[]> {

    const rescuers = await this.sosClient.getListOfRescuersByCity(municipalityCode, context);
    return rescuers;
  }
}
