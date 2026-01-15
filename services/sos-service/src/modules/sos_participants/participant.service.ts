import { ParticipantRepository } from './participant.repository';
import { SosParticipant } from './participant.model';
import { Types } from 'mongoose';
import RealtimeServiceClient from '../../services/realtime-service.client';
import { createLogger } from '../../utils/logger';
import { SOSService } from '../sos/sos.service';
import { SOSRepository } from '../sos/sos.repository';
import { SOSRealtimeClient } from '../../services/sos.realtime.client';

const logger = createLogger('SosParticipantService');

export class SosParticipantService {
  private realtimeClient: RealtimeServiceClient;
  private sosService: SOSService;
  private sosRepository: SOSRepository;

  constructor(private repository: ParticipantRepository) {
    this.realtimeClient = new RealtimeServiceClient();
    this.sosRepository = new SOSRepository();
    this.sosService = new SOSService(this.sosRepository);
  }

  /**
   * Create a new participant record when user joins SOS
   */
  async joinSos(
    sosId: string,
    userType: 'admin' | 'rescuer' | 'citizen',
    userId?: Types.ObjectId,
    actorType?: string,
  ): Promise<SosParticipant> {
    // Save to DB
    const participant = await this.repository.create({
      sosId,
      userType,
      userId,
      actorType,
    });

    // Notify realtime service to broadcast to connected clients
    try {
      await this.realtimeClient.broadcastParticipantJoined({
        sosId,
        userId: userId?.toString() || '',
        userType,
        joinedAt: participant.joinedAt,
      });
    } catch (error) {
      logger.error('Failed to notify realtime service of participant join', error);
      // Continue - participant is already saved in DB
    }

    return participant;
  }

  /**
   * Mark user as left from SOS
   */
  async leaveSos(sosId: string, userId: Types.ObjectId): Promise<void> {
    // Remove from DB
    await this.repository.markAsLeft(sosId, userId);
    await this.sosService.rescuerLeftSOS(sosId, userId.toString());

    // Notify realtime service to broadcast to connected clients
    try {
      await this.realtimeClient.broadcastParticipantLeft({
        sosId,
        userId: userId.toString(),
        leftAt: new Date(),
      });
    } catch (error) {
      logger.error('Failed to notify realtime service of participant leave', error);
      // Continue - participant is already removed from DB
    }
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
