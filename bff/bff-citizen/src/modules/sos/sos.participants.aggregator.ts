import { ParticipantsAggregator, ParticipantsServiceClient } from '@gov-ph/bff-core';

/**
 * Participants Aggregator - BFF Admin
 * Orchestrates participant operations for admin interface
 */
export class SosParticipantsAggregator {
  private aggregator: ParticipantsAggregator;

  constructor(
    private sosServiceUrl: string,
  ) {
    const client = new ParticipantsServiceClient(sosServiceUrl);
    this.aggregator = new ParticipantsAggregator(client);
  }

  /**
   * Join a SOS as a participant
   */
  async joinSos(sosId: string, data: {
    userType: string;
    userId: string;
    actorType?: string;
  }): Promise<any> {
    return await this.aggregator.joinSos(sosId, data);
  }

  /**
   * Leave a SOS participation
   */
  async leaveSos(sosId: string, userId: string): Promise<any> {
    return await this.aggregator.leaveSos(sosId, userId);
  }

  /**
   * Get active participants in a SOS
   */
  async getActiveParticipants(sosId: string): Promise<any[]> {
    return await this.aggregator.getActiveParticipants(sosId);
  }

  /**
   * Get full participant history for a SOS
   */
  async getParticipantHistory(sosId: string): Promise<any[]> {
    return await this.aggregator.getParticipantHistory(sosId);
  }

  /**
   * Check if user is active participant
   */
  async isActiveParticipant(sosId: string, userId: string): Promise<boolean> {
    return await this.aggregator.isActiveParticipant(sosId, userId);
  }

  /**
   * Get user's participation history
   */
  async getUserParticipationHistory(userId: string): Promise<any[]> {
    return await this.aggregator.getUserParticipationHistory(userId);
  }
}
