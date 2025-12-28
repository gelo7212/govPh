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
      const response = await axios.get(`${this.baseURL}/internal/sos/${sosId}`, {
        headers: {
          'x-internal-token': config.INTERNAL_AUTH_TOKEN,
        },
      });

      return response.status === 200;
    } catch (error) {
      logger.error('Error verifying SOS', { sosId, error });
      return false;
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
