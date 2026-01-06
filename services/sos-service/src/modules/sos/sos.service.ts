import { SOSRepository } from './sos.repository';
import { SOS } from './sos.model';
import { identityClient } from '../../services/identity.client';

export class SOSService {
  constructor(private repository: SOSRepository) {}

  async createSOS(data: {
    cityId: string;
    citizenId?: string;
    sosNo: string;
    longitude: number;
    latitude: number;
    message: string;
    type: string;
    address?: {
      city: string;
      barangay: string;
    };
    deviceId?: string;
  }): Promise<SOS> {
    const sos = await this.repository.create({
      cityId: data.cityId,
      citizenId: data.citizenId,
      sosNo: data.sosNo,
      status: 'ACTIVE',
      lastKnownLocation: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      },
      address: data.address,
      message: data.message,
      type: data.type,
      deviceId : data.deviceId
    });
    return sos;
  }

  async updateTag(sosId: string,  tag: string): Promise<SOS> {
    const sos = await this.repository.updateTag(sosId, tag);
    return sos;
  }

  async getSOS(id: string): Promise<SOS | null> {
    const sos = await this.repository.findById(id);
    return sos;
  }

  async listSOS(cityId: string): Promise<SOS[]> {
    const sosList = await this.repository.findAll(cityId);
    return sosList;
  }

  async listByStatus(cityId: string, status: string): Promise<SOS[]> {
    const sosList = await this.repository.findByStatus(cityId, status);
    return sosList;
  }

  async getActiveSOSByCitizen(citizenId: string): Promise<SOS | null> {
    const sosList = await this.repository.findByCitizen(citizenId);
    const activeSOS = sosList.find((sos) => sos.status === 'ACTIVE' || sos.status === 'EN_ROUTE' || sos.status === 'ARRIVED');
    return activeSOS || null;
  }

  async listByCitizen(citizenId: string): Promise<SOS[]> {
    const sosList = await this.repository.findByCitizen(citizenId);
    return sosList;
  }

  async updateLocation(sosId: string, cityId: string, location: any): Promise<SOS> {
    return await this.repository.update(cityId, sosId, {
      lastKnownLocation: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
    });
  }

  /**
   * Save location snapshot from realtime service
   * Called by location sampler with meaningful location changes
   */
  async saveLocationSnapshot(sosId: string, location: any, cityId: string): Promise<SOS> {
    // Save location with timestamp for audit trail
    try {
      if(cityId === undefined){
        throw new Error('City ID is required to save location snapshot');
      }
      if(location.address == undefined || location.address === null ){
        return await this.repository.update(cityId, sosId, {
          lastKnownLocation: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude],
          },
          lastLocationUpdate: new Date(),
        });
      }
      
      return await this.repository.update(cityId, sosId, {
        lastKnownLocation: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
        lastLocationUpdate: new Date(),
        address: location.address,
      });
    } catch (error) {
      console.error('Error saving location snapshot:', error);
      throw new Error('Failed to save location snapshot: ' + error);
    }
  }

  async sendMessage(sosId: string, cityId: string, messageData: any): Promise<any> {
    // This will be implemented with the message service
    // For now, return a mock message
    return {
      id: `msg_${Date.now()}`,
      content: messageData.content,
      createdAt: new Date(),
    };
  }

  async updateSOS(id: string, cityId: string, data: any): Promise<SOS> {
    const sos = await this.repository.update(id, cityId, data);
    return sos;
  }

  async deleteSOS(id: string, cityId: string): Promise<void> {
    await this.repository.delete(id, cityId);
  }

  async createAnonRescuer(sosId: string, requestMissionId: string, cityCode: string): Promise<string | null> {
    console.log(`Creating anon rescuer for SOS ${sosId} with mission ${requestMissionId} in city ${cityCode}`)

    const token = await identityClient.generateRescuerSosToken(sosId, requestMissionId, cityCode);
    if (token) {
        console.log(`Generated Anon Rescuer SOS Token: ${token}`); 
    } else {
        console.error('Failed to generate Anon Rescuer SOS Token');
    }
    return token
  }
  
}
