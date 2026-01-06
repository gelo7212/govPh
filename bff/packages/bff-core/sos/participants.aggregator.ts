import { ParticipantsServiceClient } from '../clients';

/**
 * Participants Aggregator - Shared orchestration layer
 * Handles participant management across all BFF services
 */
export class ParticipantsAggregator {
  constructor(private participantsClient: ParticipantsServiceClient) {}

  /**
   * Join a SOS as a participant (rescuer, citizen, admin)
   * 
   * Returns the created participant record
   */
  async joinSos(
    sosId: string,
    data: {
      userType: string;
      userId: string;
      actorType?: string;
    }
  ): Promise<any> {
    const result = await this.participantsClient.joinSos(sosId, data);
    return result;
  }

  /**
   * Leave a SOS participation
   * 
   * Marks the participant as left in the database
   */
  async leaveSos(sosId: string, userId: string): Promise<any> {
    const result = await this.participantsClient.leaveSos(sosId, userId);
    return result;
  }

  /**
   * Get all active participants in a SOS
   * 
   * Returns array of currently active participants
   */
  async getActiveParticipants(sosId: string): Promise<any[]> {
    const result = await this.participantsClient.getActiveParticipants(sosId);
    return result.data || [];
  }

  /**
   * Get full participant history for a SOS
   * 
   * Returns all participants including those who left
   */
  async getParticipantHistory(sosId: string): Promise<any[]> {
    const result = await this.participantsClient.getParticipantHistory(sosId);
    return result.data || [];
  }

  /**
   * Check if a user is currently participating in a SOS
   * 
   * Returns boolean indicating active participation status
   */
  async isActiveParticipant(sosId: string, userId: string): Promise<boolean> {
    const result = await this.participantsClient.checkActiveParticipation(sosId, userId);
    return result.data?.isActive || false;
  }

  /**
   * Get a user's participation history across all SOS requests
   * 
   * Returns array of all SOS requests the user has participated in
   */
  async getUserParticipationHistory(userId: string): Promise<any[]> {
    const result = await this.participantsClient.getUserParticipationHistory(userId);
    return result.data || [];
  }
}

export default ParticipantsAggregator;
