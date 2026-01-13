import { BaseClient, UserContext } from './base.client';
import { SosResponse } from '../types';

/**
 * SOS Service Client
 * Shared client for communicating with the sos-service microservice
 */
export class SosServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
  }

  // ==================== SOS Endpoints ====================

  /**
   * Create a new SOS request
   */
  async createSosRequest(data: any): Promise<SosResponse> {
    try {
      // Update user context from request data if provided
      if (data.userId || data.actorType || data.cityId || data.userRole) {
        this.setUserContext({
          userId: data.userId,
          actorType: data.actorType,
          cityId: data.cityId,
          role: data.userRole,
        });
      }
      
      const response = await this.client.post('/api/sos', data, 
        { headers: { 'x-device-id': data.deviceId } }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateTag(sosId: string, tag: string): Promise<SosResponse> {
    try {
      const response = await this.client.patch(`/api/sos/${sosId}/tag`, { tag });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get active SOS request for a citizen
   */
  async getActiveSosByCitizen(citizenId: string, cityId: string): Promise<SosResponse | null> {
    try {
      // Ensure cityId is in context for the request
      if (cityId && this.userContext) {
        this.userContext.cityId = cityId;
      }
      
      const response = await this.client.get('/api/sos/citizen/active', { params: { citizenId } });
      return response.data;
    }
    catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a specific SOS request by ID
   */
  async getSosRequest(sosId: string) {
    try {
      const response = await this.client.get(`/api/sos/${sosId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all SOS requests with optional filters, search, and sort
   * @param options - Configuration including:
   *   - cityId: string (REQUIRED - AND condition)
   *   - filters: { date?, type?, status?, soNo?, citizenId? } (OR conditions)
   *   - search: string (searches type, message, soNo, citizenId, id - AND with filters)
   *   - sort: { field: 'createdAt' | 'type' | 'status', order: 'asc' | 'desc' }
   */
  async getAllSosRequests(options?: any, context?: any) {
    try {
      this.setUserContext({
        userId: context.userId || undefined,
        actorType: context.actorType,
        role: context.role,
        cityId: context.cityId
      });
      const params: any = {};

      // cityId is REQUIRED and has AND logic - must be present for all requests
      if (options?.cityId) {
        params.cityId = options.cityId;
      }

      // Build filter parameters (OR logic)
      if (options?.filters) {
        if (options.filters.date) {
          if (options.filters.date.startDate) {
            params['filter[date][startDate]'] = options.filters.date.startDate;
          }
          if (options.filters.date.endDate) {
            params['filter[date][endDate]'] = options.filters.date.endDate;
          }
        }
        if (options.filters.type && options.filters.type.length > 0) {
          params['filter[type]'] = options.filters.type.join(',');
        }
        if (options.filters.status && options.filters.status.length > 0) {
          params['filter[status]'] = options.filters.status.join(',');
        }
        if (options.filters.soNo) {
          params['filter[soNo]'] = options.filters.soNo;
        }
        if (options.filters.citizenId) {
          params['filter[citizenId]'] = options.filters.citizenId;
        }
      }

      // Build search parameter (AND with filters)
      if (options?.search) {
        params.search = options.search;
      }

      // Build sort parameters
      if (options?.sort) {
        params.sort = options.sort.field;
        params.sortOrder = options.sort.order || 'desc';
      }

      // Keep backward compatibility with legacy filters
      if (options && !options.filters && !options.search && !options.sort && !options.cityId) {
        Object.assign(params, options);
      }

      if(options?.sosHqID){
        params.sosHqID = options.sosHqID;
      }

      const response = await this.client.get('/api/sos', { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update citizen location for an active SOS request
   */
  async updateLocation(sosId: string, location: any) {
    try {
      const response = await this.client.post(`/api/sos/${sosId}/location`, location);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

   /**
   * Send a message to an SOS conversation
   * POST /:sosId/messages
   */
  async sendMessage(sosId: string, data: {
    senderType: 'APP_ADMIN' | 'CITY_ADMIN' | 'SOS_ADMIN' | 'CITIZEN' | 'RESCUER';
    senderId?: string | null;
    senderDisplayName: string;
    contentType?: 'text' | 'system';
    content: string;
    cityId: string;
    options?: any;
  }) {
    try {
      // Update user context from message data
      this.setUserContext({
        userId: data.senderId || undefined,
        actorType: data.senderType,
        role: data.senderType,
        cityId: data.cityId
      });
      
      const response = await this.client.post(`/api/sos/${sosId}/messages`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a specific message by ID
   * GET /message/:messageId
   */
  async getMessage(messageId: string) {
    try {
      const response = await this.client.get(`/api/sos/message/${messageId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get messages for a specific SOS with pagination
   * GET /:sosId/messages
   */
  async getMessagesBySosId(sosId: string, skip: number = 0, limit: number = 50,
    context?: {
      role: 'APP_ADMIN' | 'CITY_ADMIN' | 'SOS_ADMIN' | 'CITIZEN' | 'RESCUER';
      userId?: string | null;
      cityId: string;
      actorType: string;      
    }) {
    try {
      if(context)
        this.setUserContext({
          userId: context.userId || undefined,
          actorType: context.actorType,
          role: context.role,
          cityId: context.cityId
        });
      const response = await this.client.get(`/api/sos/${sosId}/messages`, {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Close/Resolve an SOS request
   */
  async closeSosRequest(sosId: string, data: any, context: any) {
    try {
      // Update user context from message data
      this.setUserContext({
        userId: context.userId || undefined,
        actorType: context.actorType,
        role: context.role,
        cityId: context.cityId
      });
      const response = await this.client.patch(`/api/sos/${sosId}/status`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Cancel an SOS request
  */
  async cancelSosRequest(sosId: string, context: any) {
    try {
      // Update user context from message data
      this.setUserContext({
        userId: context.userId || undefined,
        actorType: context.actorType,
        role: context.role,
        cityId: context.cityId
      });
      const response = await this.client.post(`/api/sos/${sosId}/cancel`);
      return response.data;
    }
    catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create Anonymous Rescuer Identity for SOS
  */
  async createAnonRescuer(sosId: string, requestMissionId: string, cityCode: string, context: any) {
    try {
       this.setUserContext({
        userId: context.userId || undefined,
        actorType: context.actorType,
        role: context.role,
        cityId: context.cityId
      });

      const response = await this.client.post(`/api/sos/${sosId}/anon-rescuer`, {
        requestMissionId
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Save location snapshot from realtime service
   */
  async saveLocationSnapshot(sosId: string, data: any) {
    try {
      const response = await this.client.post(`/api/sos/${sosId}/location-snapshot`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Rescuer Endpoints ====================

  async getListOfRescuersByCity(municipalityCode: string, context: any): Promise<any[]> {
    try {
      this.setUserContext({
        userId: context.userId || undefined,
        actorType: context.actorType,
        role: context.role,
        cityId: context.cityId
      });
      const response = await this.client.get(`/api/rescuer/municipality/${municipalityCode}`);
      return response.data;
    }
    catch(error){
      console.log('Error fetching rescuers by city:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get assigned SOS for a rescuer
   */
  async getRescuerAssignment(context: any) {
    try {
      this.setUserContext({
        userId: context.userId || undefined,
        actorType: context.actorType,
        role: context.role,
        cityId: context.cityId
      });

      const response = await this.client.get('/api/rescuer/assignment');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update rescuer location
   */
  async updateRescuerLocation(location: any, context: any) {
    try {
       this.setUserContext({
        userId: context.userId || undefined,
        actorType: context.actorType,
        role: context.role,
        cityId: context.cityId
      });
      const response = await this.client.post('/api/rescuer/location', location);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Internal Dispatch Endpoints ====================

  /**
   * Assign a rescuer to an SOS request (internal endpoint)
   */
  async dispatchRescue(sosId: string, rescuerId: string, context: any) {
    try {
      this.setUserContext({
        userId: context.userId || undefined,
        actorType: context.actorType,
        role: context.role,
        cityId: context.cityId
      });
      const response = await this.client.post('/api/internal/dispatch/assign', {
        sosId,
        rescuerId,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDispatchHistory(assignedRescuerId: string, cityId: string) {
    try {
      const response = await this.client.get(`/api/internal/dispatch/rescuer/${assignedRescuerId}/history`, {
        headers: {
          'x-city-id': cityId
        }
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
