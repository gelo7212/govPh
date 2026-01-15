/**
 * Identity Client Service
 * Handles READ-ONLY calls to fetch citizen name/contact information
 */

export interface UserInfo {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  departments:{
    id: string;
    isPrimary: boolean;
  }[];
}

export class IdentityClient {
  private identityServiceUrl: string;

  constructor() {
    this.identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://govph-identity:3000';
    console.log(`Identity Service URL: ${this.identityServiceUrl}`);
  }

  /**
   * Fetch user information by ID
   * @param userId - The ID of the user
   * @returns UserInfo or null if not found
   */
  async getUserInfo(userId: string): Promise<UserInfo | null> {
    try {
      const response = await fetch(`${this.identityServiceUrl}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch user info: ${response.statusText}`);
        return null;
      }

      const data = await response.json() as { data: UserInfo };
      return data?.data as UserInfo;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  /**
   * Verify if a user exists
   * @param userId - The ID of the user
   * @returns true if user exists, false otherwise
   */
  async userExists(userId: string): Promise<boolean> {
    const user = await this.getUserInfo(userId);
    return user !== null;
  }

  async getRescuersByCity(cityId: string): Promise<UserInfo[]> {
    try {
      const response = await fetch(`${this.identityServiceUrl}/users/rescuers/municipality/${cityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.error(`Failed to fetch users by city: ${response.statusText}`);
        return [];
      }
      const data = await response.json() as { data: UserInfo[] };
      return data.data as UserInfo[];
    } catch (error) {
      console.error('Error fetching users by city:', error);
      return [];
    }
  }
}

export const identityClient = new IdentityClient();
