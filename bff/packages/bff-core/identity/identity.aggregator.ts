import { IdentityServiceClient, SosServiceClient, GeoServiceClient } from '../clients';
import { User, LoginResponse, AuthToken, CitizenRegistrationData, AdminRegistrationData } from '../types';

/**
 * Identity Aggregator - Shared orchestration layer
 * Handles authentication and user management across all BFF services
 */
export class IdentityAggregator {
  constructor(private identityClient: IdentityServiceClient) {}

  /**
   * Authenticate user with email and password
   */
  async firebaseLogin(firebaseUid: string): Promise<LoginResponse> {
    const result = await this.identityClient.authenticateUser(firebaseUid);
    return result;
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User> {
    const profile = await this.identityClient.getUserProfile(userId);
    return profile;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.identityClient.getUserByEmail(email);
    return user;
  }

  /**
   * Validate authentication token
   */
  async validateToken(token: string): Promise<AuthToken> {
    const result = await this.identityClient.validateToken(token);
    return result;
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(filters?: any): Promise<User[]> {
    const users = await this.identityClient.getAllUsers(filters);
    return users;
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const updated = await this.identityClient.updateUser(userId, data);
    return updated;
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    await this.identityClient.deleteUser(userId);
  }

  /**
   * Create new user (admin only)
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const created = await this.identityClient.createUser(userData);
    return created;
  }

  /**
   * Register citizen user
   */
  async registerCitizenUser(data: CitizenRegistrationData): Promise<User> {
    const registered = await this.identityClient.registerCitizenUser(data);
    return registered;
  } 

  async sendOtp(phoneNumber: string, context: 'login' | 'reset' | 'registration' | 'transaction' | 'authentication', firebaseId?: string, userId?: string): Promise<void> {
    const result = await this.identityClient.sendOtpToPhone(phoneNumber, context, firebaseId, userId);
    return result;
  }
  
  async verifyOtp(phoneNumber: string, code: string, context: 'login' | 'reset' | 'registration' | 'transaction' | 'authentication', firebaseId?: string, userId?: string): Promise<boolean> {
    const result = await this.identityClient.verifyPhoneOtp(phoneNumber, code, context, firebaseId, userId);
    return result;
  }

  /**
   * Create a new invite
   */
  async createInvite(role: string, municipalityCode: string, accessToken: string, department?: string, departmentId?: string): Promise<any> {
    const result = await this.identityClient.createInvite(
      role, municipalityCode, accessToken, department, departmentId);
    return result;
  }

  /**
   * Validate an invite
   */
  async validateInvite(inviteId: string): Promise<any> {
    const result = await this.identityClient.validateInvite(inviteId);
    return result;
  }

  /**
   * Accept an invite
   */
  async acceptInvite(inviteId: string, code: string, accessToken: string): Promise<any> {
    const result = await this.identityClient.acceptInvite(inviteId, code, accessToken);
    return result;
  }

  /**
   * List invites
   */
  async listInvites(filters?: any, accessToken?: string): Promise<any> {
    const result = await this.identityClient.listInvites(filters, accessToken);
    return result;
  }

  async registerAdminUser(data: AdminRegistrationData): Promise<User> {
    const registered = await this.identityClient.registerAdminUser(data);
    return registered;
  }
}
