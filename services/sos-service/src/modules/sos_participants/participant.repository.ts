import { SosParticipantModel, ISosParticipant } from './participant.mongo.schema';
import { SosParticipant } from './participant.model';
import { Types } from 'mongoose';

/**
 * Participant Repository - handles MongoDB persistence
 */
export class ParticipantRepository {
  async create(data: {
    sosId: string;
    userType: 'admin' | 'rescuer' | 'citizen';
    userId?: Types.ObjectId;
    actorType?: string;
  }): Promise<SosParticipant> {
    const participant = await SosParticipantModel.create({
      sosId: data.sosId,
      userType: data.userType,
      userId: data.userId,
      joinedAt: new Date(),
      actorType: data.actorType,
    });
    return this.mapToDTO(participant);
  }

  async findById(id: string): Promise<SosParticipant | null> {
    const participant = await SosParticipantModel.findOne({ _id: id });
    if (!participant) return null;
    return this.mapToDTO(participant);
  }

  async findActiveBySosId(sosId: string): Promise<SosParticipant[]> {
    const participants = await SosParticipantModel.find({
      sosId,
      leftAt: null,
    }).sort({ joinedAt: 1 });
    return participants.map((p) => this.mapToDTO(p));
  }

  async findHistoryBySosId(sosId: string): Promise<SosParticipant[]> {
    const participants = await SosParticipantModel.find({ sosId }).sort({
      joinedAt: -1,
    });
    return participants.map((p) => this.mapToDTO(p));
  }

  async findHistoryByUserId(userId: Types.ObjectId): Promise<SosParticipant[]> {
    const participants = await SosParticipantModel.find({ userId }).sort({
      joinedAt: -1,
    });
    return participants.map((p) => this.mapToDTO(p));
  }

  async isActive(sosId: string, userId: Types.ObjectId): Promise<boolean> {
    const participant = await SosParticipantModel.findOne({
      sosId,
      userId,
      leftAt: null,
    });
    return !!participant;
  }

  async markAsLeft(sosId: string, userId: Types.ObjectId): Promise<void> {
    await SosParticipantModel.updateOne(
      { sosId, userId, leftAt: null },
      { leftAt: new Date() },
    );
  }

  private mapToDTO(participant: ISosParticipant): SosParticipant {
    return {
      id: participant._id?.toString() || '',
      sosId: participant.sosId,
      userType: participant.userType,
      userId: participant.userId,
      joinedAt: participant.joinedAt,
      leftAt: participant.leftAt,
      actorType: participant.actorType,
    };
  }
}
