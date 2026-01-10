import { SosServiceClient } from '@gov-ph/bff-core';
import { MessagePayload, MessageResponse, MessagesListResponse } from './sos.message.types';

/**
 * Message Aggregator - Orchestrates messaging operations
 * This aggregator handles sending messages and retrieving message history
 * Coordinates with the SOS Service for persistence
 */
export class MessageAggregator {
  private sosClient: SosServiceClient;

  constructor(sosClient: SosServiceClient) {
    this.sosClient = sosClient;
  }

  /**
   * Send a message to an SOS conversation
   * 1. Validates the SOS exists
   * 2. Sends message through SOS Service
   * 3. Returns the created message
   */
  async sendMessage(sosId: string, data: MessagePayload): Promise<MessageResponse> {
    try {
      if (!sosId || !data.content) {
        throw new Error('Missing required fields: sosId, content');
      }

      const messageData = {
        senderType: data.senderType,
        senderId: data.senderId || null,
        senderDisplayName: data.senderDisplayName,
        contentType: data.contentType || 'text',
        content: data.content,
        cityId: data.cityId,
        options: data.options || {}
      };

      const result = await this.sosClient.sendMessage(sosId, messageData);
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all messages for a specific SOS conversation
   * Supports pagination with skip and limit
   */
  async getMessages(
    sosId: string,
    skip: number = 0,
    limit: number = 50,
  ): Promise<MessagesListResponse> {
    try {
      if (!sosId) {
        throw new Error('Missing required field: sosId');
      }

      const result = await this.sosClient.getMessagesBySosId(sosId, skip, limit);
      console.log('Messages fetched:', result);
      return {
        data: result.data,
        total: result.pagination?.total || 0,
        skip: result.pagination?.skip || skip,
        limit: result.pagination?.limit || limit,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single message by ID
   */
  async getMessage(messageId: string): Promise<MessageResponse> {
    try {
      if (!messageId) {
        throw new Error('Missing required field: messageId');
      }

      const result = await this.sosClient.getMessage(messageId);
      return result.data;
    } catch (error) {
      throw error;
    }
  }
}
