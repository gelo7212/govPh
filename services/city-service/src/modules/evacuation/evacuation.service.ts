import { IEvacuationCenter, EvacuationCenter } from './evacuation.schema';

export class EvacuationCenterService {
  constructor() {}

  async getAllEvacuationCenters(filters?: {
    isActive?: boolean;
    cityId?: string;
    status?: string;
  }) {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.cityId) {
      query.cityId = filters.cityId;
    }
    if (filters?.status) {
      query.status = filters.status;
    }
    return EvacuationCenter.find(query).lean().exec();
  }

  async getEvacuationCenterById(id: string) {
    return EvacuationCenter.findById(id).lean().exec();
  }

  async getEvacuationCentersByCity(
    cityId: string,
    filters?: {
      status?: string;
      isActive?: boolean;
    },
  ) {
    const query: any = { cityId };
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    return EvacuationCenter.find(query).lean().exec();
  }

  async createEvacuationCenter(data: Partial<IEvacuationCenter>) {
    const evacuationCenter = new EvacuationCenter(data);
    return evacuationCenter.save();
  }

  async updateEvacuationCenter(
    id: string,
    data: Partial<IEvacuationCenter>,
  ) {
    return EvacuationCenter.findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
  }

  async deleteEvacuationCenter(id: string) {
    return EvacuationCenter.findByIdAndDelete(id).lean().exec();
  }

  async getEvacuationCentersByIds(ids: string[]) {
    return EvacuationCenter.find({ _id: { $in: ids } }).lean().exec();
  }

  async updateCapacity(id: string, capacity: Partial<IEvacuationCenter['capacity']>) {
    return EvacuationCenter.findByIdAndUpdate(
      id,
      { $set: { 'capacity': capacity } },
      { new: true },
    )
      .lean()
      .exec();
  }

  async updateStatus(id: string, status: 'OPEN' | 'FULL' | 'CLOSED' | 'STANDBY') {
    return EvacuationCenter.findByIdAndUpdate(
      id,
      { status, lastStatusUpdate: new Date() },
      { new: true },
    )
      .lean()
      .exec();
  }
}
