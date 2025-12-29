import { SosServiceClient } from '../clients';

/**
 * Message Aggregator - Shared orchestration layer
 * Handles messaging operations across all BFF services
 */
export class MessageAggregator {
  constructor(private sosClient: SosServiceClient) {}

  /**
   * Send a message to an SOS conversation
   */
  async sendMessage(sosId: string, data: {
    senderType: 'APP_ADMIN' | 'CITY_ADMIN' | 'SOS_ADMIN' | 'CITIZEN' | 'RESCUER';
    senderId?: string | null;
    senderDisplayName: string;
    contentType?: 'text' | 'system';
    content: string;
    cityId: string;
  }): Promise<any> {
    const result = await this.sosClient.sendMessage(sosId, data);
    return result;
  }

  /**
   * Get a specific message by ID
   */
  async getMessage(messageId: string): Promise<any> {
    const message = await this.sosClient.getMessage(messageId);
    return message;
  }

  /**
   * Get messages for a specific SOS with pagination
   */
  async getMessagesBySosId(sosId: string, skip: number = 0, limit: number = 50): Promise<any> {
    const messages = await this.sosClient.getMessagesBySosId(sosId, skip, limit);
    return messages;
  }
}
