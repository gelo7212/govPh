/**
 * SOS Realtime Client Service
 * Handles HTTP calls to realtime-service for SOS coordination
 * Internal service-to-service communication
 */

import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger';

export interface SOSRealtimeState {
  sosId: string;
  citizenId: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusTransitionResult {
  sosId: string;
  previousStatus: string;
  newStatus: string;
  updatedBy: string;
  transitionedAt: string;
}

export interface NearbySOSResult {
  sosStates: SOSRealtimeState[];
  count: number;
}

export class SOSRealtimeClient {
  private realtimeServiceUrl: string;
  private internalAuthToken: string;
  private logger: Logger;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.realtimeServiceUrl = process.env.REALTIME_SERVICE_URL || 'http://localhost:3003';
    this.internalAuthToken = process.env.INTERNAL_AUTH_TOKEN || '';
    this.logger = new Logger('SOSRealtimeClient');
    
    this.axiosInstance = axios.create({
      baseURL: this.realtimeServiceUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-internal-token': this.internalAuthToken,
      },
    });
  }

  async initSOS(
    sosId: string,
    citizenId: string,
    location: { latitude: number; longitude: number },
    address: string,
  ): Promise<SOSRealtimeState> {
    try {
      const response = await this.axiosInstance.post('/api/sos/init', {
        sosId,
        citizenId,
        location,
        address,
      });

      this.logger.info('SOS realtime initialized', { sosId });
      return response.data.data as SOSRealtimeState;
    } catch (error) {
      this.logger.error('Error initializing SOS realtime context', { sosId, error });
      throw error;
    }
  }

  async updateSosType(sosId: string, type: string): Promise<void> {
    try {
      await this.axiosInstance.patch(`/internal/realtime/sos/${sosId}/type`, {
        type,
      });
      this.logger.info('SOS type updated in realtime', { sosId, type });
    }
    catch (error) {
      this.logger.error('Error updating SOS type in realtime', { sosId, type, error });
      throw error;
    }
  }

  /**
   * Close SOS realtime context
   * @param sosId - The SOS ID
   * @param closedBy - User/system that closed the SOS
   */
  async closeSOS(sosId: string, closedBy: string): Promise<void> {
    try {
      await this.axiosInstance.post(`/internal/realtime/sos/${sosId}/close`, {
        closedBy,
      });

      this.logger.info('SOS realtime closed', { sosId, closedBy });
    } catch (error) {
      this.logger.error('Error closing SOS realtime context', { sosId, error });
      throw error;
    }
  }

  /**
   * Update SOS status
   * Transitions SOS state through the status machine
   * @param sosId - The SOS ID
   * @param status - New status value
   * @param updatedBy - User/system that updated the status
   * @returns StatusTransitionResult
   */
  async updateStatus(
    sosId: string,
    status: string,
    updatedBy: string,
    oldStatus: string,
  ): Promise<StatusTransitionResult> {
    try {
      const response = await this.axiosInstance.post(`/internal/realtime/sos/${sosId}/status`, {
        status,
        updatedBy,
        oldStatus,
      });

      this.logger.info('SOS status updated', { sosId, status });
      return response.data.data as StatusTransitionResult;
    } catch (error) {
      this.logger.error('Error updating SOS status', { sosId, status, error });
      throw error;
    }
  }

  /**
   * Get SOS realtime state
   * @param sosId - The SOS ID
   * @returns SOSRealtimeState
   */
  async getSOSState(sosId: string): Promise<SOSRealtimeState | null> {
    try {
      const response = await this.axiosInstance.get(`/api/sos/${sosId}/state`);
      return response.data.data as SOSRealtimeState;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error('Error getting SOS state', { sosId, error });
      throw error;
    }
  }

  /**
   * Get nearby SOS states by radius
   * @param latitude - Center latitude
   * @param longitude - Center longitude
   * @param radiusKm - Search radius in kilometers
   * @returns NearbySOSResult
   */
  async getNearbySOSStates(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<NearbySOSResult> {
    try {
      const response = await this.axiosInstance.get('/api/sos/nearby', {
        params: {
          latitude,
          longitude,
          radius: radiusKm,
        },
      });

      return response.data.data as NearbySOSResult;
    } catch (error) {
      this.logger.error('Error getting nearby SOS states', { latitude, longitude, radiusKm, error });
      throw error;
    }
  }

  /**
   * Save location snapshot for SOS
   * @param sosId - The SOS ID
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param accuracy - Location accuracy in meters
   * @param timestamp - Snapshot timestamp
   */
  async saveLocationSnapshot(
    sosId: string,
    latitude: number,
    longitude: number,
    accuracy: number,
    timestamp: Date,
  ): Promise<void> {
    try {
      await this.axiosInstance.post(`/api/sos/${sosId}/location`, {
        latitude,
        longitude,
        accuracy,
        timestamp,
      });

      this.logger.info('Location snapshot saved', { sosId, latitude, longitude });
    } catch (error) {
      this.logger.error('Error saving location snapshot', { sosId, error });
      throw error;
    }
  }
}

export const sosRealtimeClient = new SOSRealtimeClient();
