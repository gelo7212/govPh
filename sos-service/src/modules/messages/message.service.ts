import { MessageModel, IMessage } from './message.mongo.schema';
import { Message } from './message.model';

export class MessageService {
  async sendMessage(data: any): Promise<Message> {
    const message = await MessageModel.create({
      cityId: data.cityId,
      sosId: data.sosId,
      senderId: data.senderId,
      senderRole: data.senderRole,
      content: data.content,
    });
    return this.mapToDTO(message);
  }

  async getMessagesBySOS(cityId: string, sosId: string): Promise<Message[]> {
    const messages = await MessageModel.find({ cityId, sosId }).sort({ createdAt: 1 });
    return messages.map((msg) => this.mapToDTO(msg));
  }

  async deleteMessagesBySOS(sosId: string): Promise<void> {
    await MessageModel.deleteMany({ sosId });
  }

  private mapToDTO(message: IMessage): Message {
    return {
      id: message._id?.toString() || '',
      cityId: message.cityId,
      sosId: message.sosId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      createdAt: message.createdAt,
    };
  }
}
