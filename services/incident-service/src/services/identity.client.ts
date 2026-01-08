/**
 * Identity Client Service
 * Handles calls to identity service for token generation
 */

export class IdentityClient {
  private identityServiceUrl: string;

  constructor() {
    this.identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://govph-identity:3000';
    console.log(`Identity Service URL: ${this.identityServiceUrl}`);
  }

  /**
   * Generate Share Link Token
   * @param incidentId - The ID of the incident
   * @param cityCode - The city code
   * @param contextUsage - REPORT_ASSIGNMENT or REPORT_ASSIGNMENT_DEPARTMENT
   * @param assignmentId - Optional assignment ID
   * @param departmentId - Optional department ID
   * @returns token string or null
   */
  async generateShareLinkToken(
    incidentId: string,
    cityCode: string,
    contextUsage: 'REPORT_ASSIGNMENT' | 'REPORT_ASSIGNMENT_DEPARTMENT',
    assignmentId?: string,
    departmentId?: string
  ): Promise<{
    success: boolean;
    data: {
        token: string;
        expiresAt: Date;
    };
  } | null> {
    try {
      const response = await fetch(`${this.identityServiceUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contextType: 'SHARE_LINK',
          contextUsage,
          incident: {
            incidentId,
            assignmentId,
            departmentId,
          },
          cityCode,
        }),
      });

      console.log(`Identity Service response status: ${response.status}`);

      if (!response.ok) {
        console.error(`Failed to generate share link token: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data as unknown as {
        success: boolean;
        data: {
            token: string;
            expiresAt: Date;
        };
      };
    } catch (error) {
      console.error('Error generating share link token:', error);
      return null;
    }
  }
}

export const identityClient = new IdentityClient();