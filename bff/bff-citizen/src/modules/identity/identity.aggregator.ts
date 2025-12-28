import { IdentityServiceClient } from '@gov-ph/bff-core';
import { CitizenRegistrationData } from '@gov-ph/bff-core/dist/types';

/**
 * Identity Aggregator - Orchestrates identity-related operations
 * This aggregator handles authentication and user profile operations
 */
export class IdentityAggregator {
  private identityClient: IdentityServiceClient;

  constructor(identityClient: IdentityServiceClient) {
    this.identityClient = identityClient;
  }

  /**
   * Get token for user with   const { userId, firebaseUid, contextType, cityCode, scopes, sosId, rescuerId } = req.body;
   */
  async getToken(firebaseUid: string, userId: string, sosId?: string) {
    const result = await this.identityClient.authenticateUser(firebaseUid, userId, sosId);
    return result;
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const profile = await this.identityClient.getUserProfile(userId);
    return profile;
  }

  /**
   * Validate token
   */
  async validateToken(token: string) {
    const result = await this.identityClient.validateToken(token);
    return result;
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string, sosId?: string) {
    const result = await this.identityClient.refreshToken(refreshToken, sosId);
    return result;
  }

  /**
   * Get user by Firebase UID
   */
  async getUserByFirebaseUid(firebaseUid: string) {
   try {
      console.log(`Fetching user by Firebase UID: ${firebaseUid}`);
      const user = await this.identityClient.getUserByFirebaseUid(firebaseUid);
      return user;
   } catch (error) {
      console.error('Error fetching user by Firebase UID:', {
        firebaseUid,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      throw error;
   }
  }

  async registerCitizenUser(data: CitizenRegistrationData, user?: any, municipalityCode?: string) {
    // Pass user context to identity service
    const payload = {
      ...data,
      ...(user && { authenticatedUser: user }),
      ...(municipalityCode && { municipalityCode }),
    };
    const registered = await this.identityClient.registerCitizenUser(payload);
    return registered;
  }
}
