import { AdminRegistrationData, CitizenRegistrationData, UserProfileResponse } from '../types';
import { BaseClient, UserContext } from './base.client';

/**
 * Identity Service Client
 * Shared client for communicating with the identity-service microservice
 */
export class IdentityServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
    console.log(`IdentityServiceClient initialized with baseURL: ${baseURL}`);
  }

  async getUserProfile(userId: string) {
    try {
      const response = await this.client.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserByEmail(email: string) {
    try {
      const response = await this.client.get(`/users/email/${email}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async authenticateUser(firebaseUid: string, userId?: string, sosId?: string, contextType?: string) {
    try {
      const response = await this.client.post('/auth/token', { firebaseUid, userId, sosId, contextType });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string, sosId?: string) {
    try {
      console.log(`Refreshing token for sosId: ${sosId}`);
      const response = await this.client.post('/auth/refresh', { refreshToken, sosId });
      return response.data;
    }
    catch (error) {
      return this.handleError(error);
    }
  }

  async validateToken(token: string) {
    try {
      const response = await this.client.post('/auth/validate', { token });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllUsers(filters?: any) {
    try {
      const response = await this.client.get('/users', { params: filters });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateUser(userId: string, data: any) {
    try {
      const response = await this.client.patch(`/users/${userId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteUser(userId: string) {
    try {
      const response = await this.client.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createUser(data: any) {
    try {
      const response = await this.client.post('/users', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async registerAdminUser(data: AdminRegistrationData) {
    try {
      const response = await this.client.post('/users/admin/register', data);
      return response.data;
    }
    catch (error) {
      return this.handleError(error);
    }
  }

  async registerCitizenUser(data: CitizenRegistrationData) {
    try {
      const response = await this.client.post('/users/register', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<UserProfileResponse> {
    try {
      const response = await this.client.get(`/users/firebase/${firebaseUid}`);
      return response.data;
    } catch (error) {
      console.log('Error in getUserByFirebaseUid:', error);
      return this.handleError(error);
    }
  }

  async sendOtpToPhone(
    phoneNumber: string, 
    context: 'login' | 'reset' | 'registration' | 'transaction' | 'authentication',
    firebaseId?: string,
    userId?: string
  ): Promise<any> {
    try {
      const response = await this.client.post('/sms/send/otp', { phoneNumber, context, firebaseId, userId });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async verifyPhoneOtp(
    phoneNumber: string, 
    code: string, 
    context: 'login' | 'reset' | 'registration' | 'transaction' | 'authentication',
    firebaseId?: string,
    userId?: string
  ): Promise<any> {
    try {
      const response = await this.client.post('/sms/verify/otp', { phoneNumber, code, context, firebaseId, userId });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new invite
   */
  async createInvite(role: string, municipalityCode: string, accessToken: string): Promise<any> {
    try {
      const response = await this.client.post('/invites', { role, municipalityCode }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Validate an invite (public endpoint)
   */
  async validateInvite(inviteId: string): Promise<any> {
    try {
      const response = await this.client.get(`/invites/${inviteId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Accept an invite
   */
  async acceptInvite(inviteId: string, code: string, accessToken: string): Promise<any> {
    try {
      const response = await this.client.post(`/invites/${inviteId}/accept`, { code }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * List invites with filtering
   */
  async listInvites(filters?: any, accessToken?: string): Promise<any> {
    try {
      const response = await this.client.get('/invites', { params: filters, headers: { Authorization: `Bearer ${accessToken}` } });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}