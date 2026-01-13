import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

/**
 * SOS MS Client - Communicates with SOS Microservice
 */
export class SOSMSClient {
  private baseURL: string;

  constructor() {
    this.baseURL = config.SOS_MS_URL;
  }

  /**
   * Call SOS MS to verify SOS exists
   */
  async verifySOS(sosId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/api/sos/${sosId}`, {
        headers: {
          'x-internal-token': config.INTERNAL_AUTH_TOKEN,
        },
      });
      logger.info('SOS verification response', { sosId, url: `${this.baseURL}/internal/sos/${sosId}`, status: response.data });
      return response.status === 200 || response.status === 204;
    } catch (error) {
      logger.error('Error verifying SOS', { sosId, error });
      return false;
    }
  }

  async getSos(sosId: string, headerContext: any): Promise<any> {
    try {
      const headers = {
        'x-internal-token': config.INTERNAL_AUTH_TOKEN,
        ...headerContext,
      };
     
      const response = await axios.get(`${this.baseURL}/api/sos/${sosId}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      logger.error('Error getting SOS', { sosId, error });
      return null;
    }
  }

  /**
   * Notify SOS MS of realtime event
   */
  async notifySOSEvent(sosId: string, event: string, data: any): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/internal/realtime/event`,
        { sosId, event, data },
        {
          headers: {
            'x-internal-token': config.INTERNAL_AUTH_TOKEN,
          },
        }
      );
    } catch (error) {
      logger.error('Error notifying SOS MS', { sosId, event, error });
      // Don't throw - log and continue
    }
  }

  async updateStatus(sosId: string, status: string, headerContext: any): Promise<void> {
    try {
      await axios.patch(
        `${this.baseURL}/api/sos/${sosId}/status`,
        { status },
        {
          headers: {
            'x-internal-token': config.INTERNAL_AUTH_TOKEN,
            ...headerContext,
          },
        }
      );
    } catch (error) {
      logger.error('Error updating SOS status', { sosId, status, error });
      // Don't throw - log and continue
    }
  }

  /**
   * Get SOS details from SOS MS
   */
  async getSOSDetails(sosId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/internal/sos/${sosId}/details`, {
        headers: {
          'x-internal-token': config.INTERNAL_AUTH_TOKEN,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Error getting SOS details', { sosId, error });
      return null;
    }
  }
}

export default SOSMSClient;
