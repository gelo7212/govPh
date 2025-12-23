import { IdentityServiceClient, SosServiceClient, GeoServiceClient } from '../clients';
import { User, LoginResponse, AuthToken } from '../types';

/**
 * Identity Aggregator - Shared orchestration layer
 * Handles authentication and user management across all BFF services
 */
export class IdentityAggregator {
  constructor(private identityClient: IdentityServiceClient) {}

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const result = await this.identityClient.authenticateUser(email, password);
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
}
