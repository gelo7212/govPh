import { SOSRepository } from './sos.repository';
import { SOS } from './sos.model';

export class SOSService {
  constructor(private repository: SOSRepository) {}

  async createSOS(data: any): Promise<SOS> {
    const sos = await this.repository.create(data);
    return sos;
  }

  async getSOS(id: string, cityId: string): Promise<SOS | null> {
    const sos = await this.repository.findById(id, cityId);
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

  async updateLocation(sosId: string, cityId: string, location: any): Promise<SOS> {
    return await this.repository.update(cityId, sosId, {
      lastKnownLocation: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
    });
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
}
