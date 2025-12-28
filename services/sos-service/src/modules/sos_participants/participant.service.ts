import { ParticipantRepository } from './participant.repository';
import { SosParticipant } from './participant.model';
import { Types } from 'mongoose';

export class SosParticipantService {
  constructor(private repository: ParticipantRepository) {}

  /**
   * Create a new participant record when user joins SOS
   */
  async joinSos(
    sosId: string,
    userType: 'admin' | 'rescuer',
    userId: Types.ObjectId,
  ): Promise<SosParticipant> {
    return await this.repository.create({
      sosId,
      userType,
      userId,
    });
  }

  /**
   * Mark user as left from SOS
   */
  async leaveSos(sosId: string, userId: Types.ObjectId): Promise<void> {
    await this.repository.markAsLeft(sosId, userId);
  }

  /**
   * Get all active participants in an SOS
   */
  async getActiveParticipants(sosId: string): Promise<SosParticipant[]> {
    return await this.repository.findActiveBySosId(sosId);
  }

  /**
   * Get participant history for an SOS (including those who left)
   */
  async getParticipantHistory(sosId: string): Promise<SosParticipant[]> {
    return await this.repository.findHistoryBySosId(sosId);
  }

  /**
   * Check if user is currently participating in an SOS
   */
  async isActiveParticipant(
    sosId: string,
    userId: Types.ObjectId,
  ): Promise<boolean> {
    return await this.repository.isActive(sosId, userId);
  }

  /**
   * Get user's participation history
   */
  async getUserParticipationHistory(
    userId: Types.ObjectId,
  ): Promise<SosParticipant[]> {
    return await this.repository.findHistoryByUserId(userId);
  }
}
