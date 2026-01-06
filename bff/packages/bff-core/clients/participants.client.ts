import { BaseClient, UserContext } from './base.client';

/**
 * Participants Service Client
 * Shared client for communicating with participant endpoints in sos-service
 */
export class ParticipantsServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
  }

  /**
   * Join a SOS as a participant
   * POST /api/sos/:sosId/participants/join
   */
  async joinSos(sosId: string, data: {
    userType: string;
    userId: string;
    actorType?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post(
        `/api/sos/${sosId}/participants/join`,
        data
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Leave a SOS participation
   * PATCH /api/sos/:sosId/participants/:userId/leave
   */
  async leaveSos(sosId: string, userId: string): Promise<any> {
    try {
      const response = await this.client.patch(
        `/api/sos/${sosId}/participants/${userId}/leave`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get active participants in a SOS
   * GET /api/sos/:sosId/participants/active
   */
  async getActiveParticipants(sosId: string): Promise<any> {
    try {
      const response = await this.client.get(
        `/api/sos/${sosId}/participants/active`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get participant history for a SOS
   * GET /api/sos/:sosId/participants/history
   */
  async getParticipantHistory(sosId: string): Promise<any> {
    try {
      const response = await this.client.get(
        `/api/sos/${sosId}/participants/history`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Check if user is active participant in a SOS
   * GET /api/sos/:sosId/participants/:userId/check
   */
  async checkActiveParticipation(sosId: string, userId: string): Promise<any> {
    try {
      const response = await this.client.get(
        `/api/sos/${sosId}/participants/${userId}/check`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user's participation history across all SOS
   * GET /api/sos/user/:userId/history
   */
  async getUserParticipationHistory(userId: string): Promise<any> {
    try {
      // Note: This endpoint pattern depends on how it's routed in the SOS Service
      const response = await this.client.get(
        `/api/sos/user/${userId}/history`
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default ParticipantsServiceClient;
