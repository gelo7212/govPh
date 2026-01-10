import { BaseClient, UserContext } from './base.client';

/**
 * Realtime Service Client
 * Handles communication with the Realtime Service for SOS tracking
 */
export class RealtimeServiceClient extends BaseClient {
  constructor(baseURL: string = process.env.REALTIME_SERVICE_URL || 'http://govph-realtime:3000', userContext?: UserContext) {
    super(baseURL, userContext);
  }

  /**
   * Initialize SOS realtime context
   * Called after SOS is created in the SOS service
   */
  async initSosContext(sosId: string, citizenId: string, location?: any): Promise<any> {
    try {
      const response = await this.client.post('/internal/realtime/sos/init', {
        sosId,
        citizenId,
        location,
      });
      return response.data;
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Close SOS realtime context
   * Called when SOS is closed
   */
  async closeSosContext(sosId: string, closedBy: string): Promise<any> {
    try {
      const response = await this.client.post(`/internal/realtime/sos/${sosId}/close`, {
        closedBy,
      });
      return response.data;
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Get SOS realtime state
   */
  async getSosState(sosId: string): Promise<any> {
    try {
      const response = await this.client.get(`/internal/realtime/sos/${sosId}/state`);
      return response.data;
    } catch (error) {
      await this.handleError(error);
    }
  }

  async getSOSNearbyLocation(latitude: number, longitude: number, radius: number): Promise<any[]> {
    try {
      const response = await this.client.get('/internal/realtime/sos/nearby', {
        params: { latitude, longitude, radius },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getRescuerLocation(sosId: string, rescuerId: string): Promise<any> {
    try {
      const response = await this.client.get(`/internal/realtime/sos/${sosId}/rescuer-location`, {
        params: { rescuerId },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  async upsertRescuerLocation(sosId: string, rescuerId: string, latitude: number, longitude: number, accuracy?: number): Promise<any> {
    try {
      const response = await this.client.post(`/internal/realtime/sos/${sosId}/rescuer-location`, {
        rescuerId,
        latitude,
        longitude,
        accuracy
      });
      return response.data;
    }catch (error) {
      return this.handleError(error);
    }
  }
}
export default RealtimeServiceClient;
