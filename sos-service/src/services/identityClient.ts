/**
 * Identity Client Service
 * Handles READ-ONLY calls to fetch citizen name/contact information
 */

export interface CitizenInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export class IdentityClient {
  private identityServiceUrl: string;

  constructor() {
    this.identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3000';
  }

  /**
   * Fetch citizen information by ID
   * @param citizenId - The ID of the citizen
   * @returns CitizenInfo or null if not found
   */
  async getCitizenInfo(citizenId: string): Promise<CitizenInfo | null> {
    try {
      const response = await fetch(`${this.identityServiceUrl}/api/citizens/${citizenId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch citizen info: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data as CitizenInfo;
    } catch (error) {
      console.error('Error fetching citizen info:', error);
      return null;
    }
  }

  /**
   * Verify if a citizen exists
   * @param citizenId - The ID of the citizen
   * @returns true if citizen exists, false otherwise
   */
  async citizenExists(citizenId: string): Promise<boolean> {
    const citizen = await this.getCitizenInfo(citizenId);
    return citizen !== null;
  }
}

export const identityClient = new IdentityClient();
