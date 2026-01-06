import axios, { AxiosInstance } from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('RealtimeServiceClient');

/**
 * Realtime Service Client
 * 
 * Used by SOS Service to trigger participant-related socket events
 * in the Realtime Service via HTTP API.
 */
export class RealtimeServiceClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (process.env.REALTIME_SERVICE_URL || 'http://govph-realtime:3000');
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Request': 'true', // Mark as internal request
      },
    });
  }

  /**
   * Notify realtime service that a participant joined
   * Triggers participant:joined broadcast to all connected clients
   */
  async broadcastParticipantJoined(data: {
    sosId: string;
    userId: string;
    userType: string;
    displayName?: string;
    joinedAt?: Date;
  }): Promise<void> {
    try {
      await this.client.post('/internal/participants/joined', data);
      logger.info('Notified realtime service: participant joined', {
        sosId: data.sosId,
        userId: data.userId,
      });
    } catch (error) {
      logger.error('Failed to notify realtime service of participant join', {
        sosId: data.sosId,
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw - participant already saved in DB, just socket notification failed
    }
  }

  /**
   * Notify realtime service that a participant left
   * Triggers participant:left broadcast to all connected clients
   */
  async broadcastParticipantLeft(data: {
    sosId: string;
    userId: string;
    leftAt?: Date;
  }): Promise<void> {
    try {
      await this.client.post('/internal/participants/left', data);
      logger.info('Notified realtime service: participant left', {
        sosId: data.sosId,
        userId: data.userId,
      });
    } catch (error) {
      logger.error('Failed to notify realtime service of participant leave', {
        sosId: data.sosId,
        userId: data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw - participant already removed from DB, just socket notification failed
    }
  }

  /**
   * Get currently active participants in a SOS room
   * Returns socket-level view (different from DB participants)
   */
  async getActiveParticipants(sosId: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/internal/participants/${sosId}/active`);
      return response.data.data?.participants || [];
    } catch (error) {
      logger.error('Failed to get active participants from realtime service', {
        sosId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Get count of active participants in a SOS room
   */
  async getParticipantCount(sosId: string): Promise<number> {
    try {
      const response = await this.client.get(`/internal/participants/${sosId}/count`);
      return response.data.data?.count || 0;
    } catch (error) {
      logger.error('Failed to get participant count from realtime service', {
        sosId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 0;
    }
  }
}

export default RealtimeServiceClient;
