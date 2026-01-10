import { SosMessageModel, ISosMessage } from './message.mongo.schema';
import { SosMessage } from './message.model';
import { Types } from 'mongoose';
import { UserRole } from '../../types';

/**
 * Message Repository - handles MongoDB persistence
 */
export class MessageRepository {
  async create(data: {
    sosId: string;
    senderType: 'CITIZEN' | 'SOS_ADMIN' | 'RESCUER' | 'SYSTEM';
    senderId?: Types.ObjectId | null;
    senderDisplayName: string;
    contentType: 'text' | 'system';
    content: string;
    options: any;
  }): Promise<SosMessage> {
    const message = await SosMessageModel.create({
      sosId: data.sosId,
      senderType: data.senderType,
      senderId: data.senderId || null,
      senderDisplayName: data.senderDisplayName,
      contentType: data.contentType,
      content: data.content,
      options: data.options,
    });
    return this.mapToDTO(message);
  }

  async findById(id: string): Promise<SosMessage | null> {
    const message = await SosMessageModel.findOne({ _id: id });
    if (!message) return null;
    return this.mapToDTO(message);
  }

  async findBySosId(
    sosId: string,
    skip: number = 0,
    limit: number = 50,
    userRole?: UserRole
  ): Promise<{ messages: SosMessage[]; total: number }> {

    // If userRole is provided, dont show messages intended for other roles
    // if role is CITIZEN, show only messages intended for CITIZEN
    // if role is ADMIN, show only messages intended for SOS_ADMIN
    // if role is RESCUER, show only messages intended for RESCUER

    if(userRole){
      const intendedForFilter = userRole === 'CITIZEN' ? 'CITIZEN' :
                                userRole === 'ADMIN' ? 'SOS_ADMIN' :
                                userRole === 'RESCUER' ? 'RESCUER' : 
                                userRole === 'SOS_ADMIN' ? 'SOS_ADMIN' : null;
      if(intendedForFilter){
        const messages = await SosMessageModel.find({ 
          sosId ,
          'options.intendedFor': intendedForFilter
        })
        .sort({ createdAt: -1 }) // latest messages first
        .skip(skip)
        .limit(limit)
        .exec();
        const total = await SosMessageModel.countDocuments({ 
          sosId,
          'options.intendedFor': intendedForFilter
          });
        return {
          messages: messages.map((msg) => this.mapToDTO(msg)),
          total,
        };
      };
    }
                         
    const messages = await SosMessageModel.find({ 
      sosId ,
      })
      .sort({ createdAt: -1 }) // latest messages first
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await SosMessageModel.countDocuments({ sosId });
    return {
      messages: messages.map((msg) => this.mapToDTO(msg)),
      total,
    };
  }
  

  async deleteMessagesBySosId(sosId: string): Promise<void> {
    await SosMessageModel.deleteMany({ sosId });
  }

  private mapToDTO(message: ISosMessage): SosMessage {
    return {
      id: message._id?.toString() || '',
      sosId: message.sosId,
      senderType: message.senderType,
      senderId: message.senderId,
      senderDisplayName: message.senderDisplayName,
      contentType: message.contentType,
      content: message.content,
      createdAt: message.createdAt,
      options: message.options,
    };
  }
}
