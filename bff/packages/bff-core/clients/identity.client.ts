import { CitizenRegistrationData, UserProfileResponse } from '../types';
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

  async authenticateUser(firebaseUid: string, userId?: string, sosId?: string) {
    try {
      const response = await this.client.post('/auth/token', { firebaseUid, userId, sosId });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string, sosId?: string) {
    try {
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
}
