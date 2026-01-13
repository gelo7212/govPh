import { MessageRepository } from './message.repository';
import { SosMessage } from './message.model';
import { Types } from 'mongoose';
import axios from 'axios';
import { Logger } from '../../utils/logger';
import { UserRole } from '../../types';
import { eventBus, MESSAGE_EVENTS, type MessageSentEvent, type MessageResponseReceivedEvent } from '../events';
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
    options?: any;
  }): Promise<SosMessage> {
    const message = await this.repository.create({
      sosId: data.sosId,
      senderType: data.senderType,
      senderId: data.senderId ? new Types.ObjectId(data.senderId) : null,
      senderDisplayName: data.senderDisplayName,
      contentType: data.contentType || 'text',
      content: data.content,
      options: data.options || {},
    });

    // Broadcast to realtime service after message is persisted
    try {
      await this.broadcastMessageToRealtime(data.sosId, message);

      if(data.options?.answerTo){
        const messageResponseEvent: MessageResponseReceivedEvent = {
          messageId: message.id,
          sosId: message.sosId,
          answerTo: message.options?.answerTo,
          senderType: message.senderType,
          senderId: message.senderId ? message.senderId.toString() : '',
          content: message.content,
          contentType: message.contentType,
          senderDisplayName: message.senderDisplayName,
          createdAt: message.createdAt,
        };
        eventBus.emit(MESSAGE_EVENTS.RESPONSE_RECEIVED, messageResponseEvent);
      }


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
      this.logger.info('Broadcasting message to realtime service', { messageId: message.id, sosId, options: message.options || {} });
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
            options: message.options || {}
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
    userRole?: UserRole
  ): Promise<{ messages: SosMessage[]; total: number }> {
    return await this.repository.findBySosId(sosId, skip, limit, userRole);
  }

  async getMessage(messageId: string): Promise<SosMessage | null> {
    return await this.repository.findById(messageId);
  }

  async deleteMessagesBySosId(sosId: string): Promise<void> {
    await this.repository.deleteMessagesBySosId(sosId);
  }
}
