import { MessageRepository } from './message.repository';
import { SosMessage } from './message.model';
import { Types } from 'mongoose';
import axios from 'axios';
import { Logger } from '../../utils/logger';

export class MessageService {
  private realtimeServiceUrl = process.env.REALTIME_SERVICE_URL || 'http://govph-realtime:3000';
  private internalToken = process.env.INTERNAL_AUTH_TOKEN || 'internal-secret-key';
  private logger = new Logger('MessageService');

  constructor(private repository: MessageRepository) {}

  async sendMessage(data: {
    sosId: string;
    senderType: 'CITIZEN' | 'SOS_ADMIN' | 'RESCUER' | 'SYSTEM';
    senderId?: string | null;
    senderDisplayName: string;
    contentType?: 'text' | 'system';
    content: string;
  }): Promise<SosMessage> {
    const message = await this.repository.create({
      sosId: data.sosId,
      senderType: data.senderType,
      senderId: data.senderId ? new Types.ObjectId(data.senderId) : null,
      senderDisplayName: data.senderDisplayName,
      contentType: data.contentType || 'text',
      content: data.content,
    });

    // Broadcast to realtime service after message is persisted
    try {
      await this.broadcastMessageToRealtime(data.sosId, message);
    } catch (error) {
      this.logger.error('Failed to broadcast message to realtime service', error);
      // Don't fail the message creation if realtime broadcast fails
    }

    return message;
  }

  /**
   * Broadcast message to realtime service for socket emission
   */
  private async broadcastMessageToRealtime(sosId: string, message: SosMessage): Promise<void> {
    try {
      await axios.post(
        `${this.realtimeServiceUrl}/internal/messaging/broadcast`,
        {
          sosId: message.sosId,
          message: {
            id: message.id,
            sosId: message.sosId,
            senderType: message.senderType,
            senderId: message.senderId || null,
            senderDisplayName: message.senderDisplayName,
            contentType: message.contentType,
            content: message.content,
            createdAt: message.createdAt,
          },
        },
        {
          headers: {
            'x-internal-token': this.internalToken,
          },
        },
      );
      this.logger.info('Message broadcast to realtime service', { messageId: message.id, sosId });
    } catch (error) {
      this.logger.error('Error broadcasting message to realtime service', {
        error: error instanceof Error ? error.message : 'Unknown error',
        messageId: message.id,
        sosId,
      });
      throw error;
    }
  }

  async getMessagesBySosId(
    sosId: string,
    skip: number = 0,
    limit: number = 50,
  ): Promise<{ messages: SosMessage[]; total: number }> {
    return await this.repository.findBySosId(sosId, skip, limit);
  }

  async getMessage(messageId: string): Promise<SosMessage | null> {
    return await this.repository.findById(messageId);
  }

  async deleteMessagesBySosId(sosId: string): Promise<void> {
    await this.repository.deleteMessagesBySosId(sosId);
  }
}
