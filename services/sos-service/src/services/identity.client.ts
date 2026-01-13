/**
 * Identity Client Service
 * Handles READ-ONLY calls to fetch citizen name/contact information
 */

export interface CitizenInfo {
  id: string;
  displayName: string;
  email: string;
  phone: string;
}

export class IdentityClient {
  private identityServiceUrl: string;

  constructor() {
    this.identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://govph-identity:3000';
    console.log(`Identity Service URL: ${this.identityServiceUrl}`);
  }

  /**
   * Fetch citizen information by ID
   * @param citizenId - The ID of the citizen
   * @returns CitizenInfo or null if not found
   */
  async getCitizenInfo(citizenId: string): Promise<CitizenInfo | null> {
    try {
      const response = await fetch(`${this.identityServiceUrl}/users/${citizenId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch citizen info: ${response.statusText}`);
        return null;
      }

      const data = await response.json() as { data: CitizenInfo };
      return data?.data as CitizenInfo;
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

  /**
   * Generate Anon Rescuer SOS token
   * @param rescuerId - The ID of the rescuer
   * @returns token string
   */
  async generateRescuerSosToken(sosId: string, requestMissionId: string, cityCode: string): Promise<string | null> {
    try {
      /*
      request body
       contextType
        sosId
        requestMissionId
        cityCode
        api rsponse
            {
              success: true,
              data: token,
              timestamp: new Date(),
            } 
      */
      const response = await fetch(`${this.identityServiceUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contextType: 'ANON_RESCUER',
          sosId,
          requestMissionId,
          cityCode,
        }),
      });
      if (!response.ok) {
        console.error(`Failed to generate rescuer SOS token: ${response.statusText}`);
        return null;
      }
      const data = await response.json() as { data: string };
      return data.data as string;
    }
    catch (error) {
      console.error('Error generating rescuer SOS token:', error);
      return null;
    }
  }

  async getRescuersByCity(cityId: string): Promise<CitizenInfo[]> {
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
      const data = await response.json() as { data: CitizenInfo[] };
      return data.data as CitizenInfo[];
    } catch (error) {
      console.error('Error fetching users by city:', error);
      return [];
    }
  }
}

export const identityClient = new IdentityClient();
