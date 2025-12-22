import { SOSModel, ISOS } from './sos.mongo.schema';
import { SOS } from './sos.model';

/**
 * SOS Repository - handles MongoDB persistence
 */
export class SOSRepository {
  async create(data: any): Promise<SOS> {
    const sos = await SOSModel.create({
      cityId: data.cityId,
      citizenId: data.citizenId,
      status: 'ACTIVE',
      lastKnownLocation: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      },
      notes: data.notes,
    });
    return this.mapToDTO(sos);
  }

  async findById(cityId: string, id: string): Promise<SOS | null> {
    const sos = await SOSModel.findOne({ cityId, _id: id });
    if (!sos) return null;
    return this.mapToDTO(sos);
  }

  async findAll(cityId: string): Promise<SOS[]> {
    const sosList = await SOSModel.find({ cityId }).sort({ createdAt: -1 });
    return sosList.map((sos) => this.mapToDTO(sos));
  }

  async findByStatus(cityId: string, status: string): Promise<SOS[]> {
    const sosList = await SOSModel.find({ cityId, status }).sort({ createdAt: -1 });
    return sosList.map((sos) => this.mapToDTO(sos));
  }

  async findByRescuerId(cityId: string, rescuerId: string): Promise<SOS[]> {
    const sosList = await SOSModel.find({ cityId, assignedRescuerId: rescuerId }).sort({ createdAt: -1 });
    return sosList.map((sos) => this.mapToDTO(sos));
  }

  async update(cityId: string, id: string, data: any): Promise<SOS> {
    const sos = await SOSModel.findOneAndUpdate(
      { cityId, _id: id },
      data,
      { new: true }
    );
    if (!sos) {
      throw new Error('SOS request not found');
    }
    return this.mapToDTO(sos);
  }

  async delete(cityId: string, id: string): Promise<void> {
    await SOSModel.findOneAndDelete({ cityId, _id: id });
  }

  private mapToDTO(sos: ISOS): SOS {
    return {
      id: sos._id?.toString() || '',
      cityId: sos.cityId,
      citizenId: sos.citizenId,
      status: sos.status,
      createdAt: sos.createdAt,
      updatedAt: sos.updatedAt,
      assignedRescuerId: sos.assignedRescuerId,
      lastKnownLocation: sos.lastKnownLocation,
      notes: sos.notes,
    };
  }
}
