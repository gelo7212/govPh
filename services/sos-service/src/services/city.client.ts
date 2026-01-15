/**
 * City Client Service
 * Handles READ-ONLY calls to fetch city and SOS HQ information from city-service
 */

export interface SosHQInfo {
  _id: string;
  scopeLevel: 'CITY' | 'PROVINCE';
  cityCode?: string;
  cityId?: string;
  provinceCode?: string;
  name: string;
  contactNumber?: string;
  address?: string;
  location: {
    lat: number;
    lng: number;
  };
  coverageRadiusKm?: number;
  supportedDepartment: {
    id: string;
    name: string;
    code: string;
  }[];
  isMain: boolean;
  isTemporary: boolean;
  isActive: boolean;
  activatedAt?: Date;
  deactivatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class CityClient {
  private cityServiceUrl: string;

  constructor() {
    this.cityServiceUrl = process.env.CITY_SERVICE_URL || 'http://govph-city:3000';
    console.log(`City Service URL: ${this.cityServiceUrl}`);
  }

  /**
   * Fetch SOS HQ information by city ID
   * @param cityId - The ID of the city
   * @returns Array of SosHQInfo or empty array if not found
   */
  async getHQByCity(cityId: string): Promise<SosHQInfo[]> {
    try {
      const response = await fetch(`${this.cityServiceUrl}/api/cities/${cityId}/sos-hq`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch HQ by city: ${response.statusText}`);
        return [];
      }

      const data = await response.json() as { data: SosHQInfo[] };
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching HQ by city:', error);
      return [];
    }
  }

  /**
   * Fetch SOS HQ information by city ID and HQ ID
   * @param cityId - The ID of the city
   * @param hqId - The ID of the SOS HQ
   * @returns SosHQInfo or null if not found
   */
  async getHQByCityAndId(cityId: string, hqId: string): Promise<SosHQInfo | null> {
    try {
      const hqList = await this.getHQByCity(cityId);
      const hq = hqList.find(item => item._id === hqId);
      return hq || null;
    } catch (error) {
      console.error('Error fetching HQ by city and ID:', error);
      return null;
    }
  }

  /**
   * Fetch SOS HQ information by HQ ID directly
   * @param hqId - The ID of the SOS HQ
   * @returns SosHQInfo or null if not found
   */
  async getHQById(hqId: string): Promise<SosHQInfo | null> {
    try {
      const response = await fetch(`${this.cityServiceUrl}/api/sos-hq/${hqId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch HQ by ID: ${response.statusText}`);
        return null;
      }

      const data = await response.json() as { data: SosHQInfo };
      return data?.data || null;
    } catch (error) {
      console.error('Error fetching HQ by ID:', error);
      return null;
    }
  }

  /**
   * Fetch all SOS HQs for a city
   * @param cityCode - The code of the city
   * @returns Array of SosHQInfo or empty array if not found
   */
  async getHQByCityCode(cityCode: string): Promise<SosHQInfo[]> {
    try {
      const response = await fetch(
        `${this.cityServiceUrl}/api/sos-hq?cityCode=${encodeURIComponent(cityCode)}&isActive=true`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        console.error(`Failed to fetch HQ by city code: ${response.statusText}`);
        return [];
      }

      const data = await response.json() as { data: SosHQInfo[] };
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching HQ by city code:', error);
      return [];
    }
  }
}
