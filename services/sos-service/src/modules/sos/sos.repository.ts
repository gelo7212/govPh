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
      message: data.message,
      type: data.type,
      soNo: data.sosNo,
      deviceId : data.deviceId
    });
    return this.mapToDTO(sos);
  }

  async findById(id: string): Promise<SOS | null> {
    const sos = await SOSModel.findOne({  _id: id });
    if (!sos) return null;
    return this.mapToDTO(sos);
  }

  async findAll(cityId: string, options?: {
    filters?: {
      date?: { startDate?: string; endDate?: string };
      type?: string[];
      status?: string[];
      soNo?: string;
      citizenId?: string;
    };
    search?: string;
    sort?: {
      field: 'createdAt' | 'type' | 'status';
      order: 'asc' | 'desc';
    };
  }, hqLocation?: {
    longitude: number;
    latitude: number;
    radius: number;
  }): Promise<SOS[]> {
    const query: any = { cityId };

    // Build filter conditions (OR logic for filter fields)
    if (options?.filters) {
      const filterConditions: any[] = [];

      if (options.filters.date?.startDate || options.filters.date?.endDate) {
        const dateFilter: any = {};
        if (options.filters.date.startDate) {
          dateFilter.$gte = new Date(options.filters.date.startDate);
        }
        if (options.filters.date.endDate) {
          dateFilter.$lte = new Date(options.filters.date.endDate);
        }
        filterConditions.push({ createdAt: dateFilter });
      }

      if (options.filters.type && options.filters.type.length > 0) {
        const typeRegexes = options.filters.type.map(t => ({ type: { $regex: `^${t}$`, $options: 'i' } }));
        filterConditions.push({ $or: typeRegexes });
      }

      if (options.filters.status && options.filters.status.length > 0) {
        filterConditions.push({ status: { $in: options.filters.status } });
      }

      if (options.filters.soNo) {
        filterConditions.push({ soNo: { $regex: options.filters.soNo, $options: 'i' } });
      }

      if (options.filters.citizenId) {
        filterConditions.push({ citizenId: options.filters.citizenId });
      }

      // Apply OR condition for filters
      if (filterConditions.length > 0) {
        query.$or = filterConditions;
      }
    }

    // Build search condition (AND logic with filters, searches in multiple fields)
    if (options?.search) {
      const searchRegex = { $regex: options.search, $options: 'i' };
      const searchConditions = [
        { message: searchRegex },
        { soNo: searchRegex },
        { citizenId: { $regex: options.search, $options: 'i' } },
        { 'responders.departmentId': { $regex: options.search, $options: 'i' } },
      ];
      query.$and = query.$and || [];
      query.$and.push({ $or: searchConditions });
    }

    // Add geospatial filter if HQ location is provided
    if(hqLocation){
      console.log('Applying geospatial filter with HQ location:', hqLocation);
      query['lastKnownLocation'] = {
        $geoWithin: {
          $centerSphere: [
            [hqLocation.longitude, hqLocation.latitude],
            hqLocation.radius / 6.378137 // radius in radians (hqLocation.radius is in km, Earth radius is 6378.137 km)
          ]
        }
      };
    }

    // Build sort
    const sortObj: any = {};
    if (options?.sort) {
      sortObj[options.sort.field] = options.sort.order === 'asc' ? 1 : -1;
    } else {
      sortObj.createdAt = -1; // Default sort by creation date descending
    }
    console.log('Final Query:', JSON.stringify(query));
    console.log('Sort Object:', JSON.stringify(sortObj));

    const sosList = await SOSModel.find(query).sort(sortObj);
    return sosList.map((sos) => this.mapToDTO(sos));
  }

  async findByStatus(cityId: string, status: string): Promise<SOS[]> {
    const sosList = await SOSModel.find({ cityId, status }).sort({ createdAt: -1 });
    return sosList.map((sos) => this.mapToDTO(sos));
  }

  async findByCitizen(citizenId: string): Promise<SOS[]> {
    const sosList = await SOSModel.find({ citizenId }).sort({ createdAt: -1 }); // Latest first
    return sosList.map((sos) => this.mapToDTO(sos));
  }

  async findByRescuerId( rescuerId: string): Promise<SOS[]> {
    try {
      // Find SOS where assignedResponders contains an entry with userId = rescuerId, sos main status is not CLOSED | RESOLVED | CANCELLED
      const sosList = await SOSModel.find({
        'assignedResponders.userId': rescuerId,
        status: { $nin: ['CLOSED', 'RESOLVED', 'CANCELLED', 'REJECTED', 'FAKE'] }
      }).sort({ createdAt: -1 });
      return sosList.map((sos) => this.mapToDTO(sos));
    } catch (error) {
      throw new Error(`Error finding SOS by rescuer ID: ${error}`);
    }
  }

  async updateTag(id: string, tag: string): Promise<SOS> {
    const sos = await SOSModel.findOneAndUpdate(
      { _id: id },
      { type: tag },
      { new: true }
    );
    if (!sos) {
      throw new Error('SOS request not found');
    }
    return this.mapToDTO(sos);
  }
  // Mark rescuer assignedResponders as LEFT
  async rescuerLeftSOS(sosId: string, rescuerId: string): Promise<void> {
    await SOSModel.updateOne(
      { _id: sosId, 'assignedResponders.userId': rescuerId },
      { $set: { 'assignedResponders.$.status': 'LEFT' } }
    );
  }

  async updateWithoutCity(id: string, data: any): Promise<SOS> {
    const sos = await SOSModel.findOneAndUpdate(
      { _id: id },
      data,
      { new: true }
    );
    console.log('Updated SOS:', sos);
    if (!sos) {
      throw new Error('SOS request not found');
    }
    return this.mapToDTO(sos);
  }

  async updateStatus(sosId: string, status: string, resolutionNote?: string): Promise<SOS> {
    const sos = await SOSModel.findOneAndUpdate(
      {
        _id: sosId,
      },
      { status: status, ...(resolutionNote ? { resolutionNote: resolutionNote } : {}) },
      { new: true }
    );
    if (!sos) {
      throw new Error('SOS request not found');
    }
    return this.mapToDTO(sos);
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
      cityId: sos.cityId || '',
      citizenId: sos.citizenId || '',
      status: sos.status,
      createdAt: sos.createdAt,
      updatedAt: sos.updatedAt,
      assignedResponders: sos.assignedResponders as unknown as SOS['assignedResponders'] || [],
      lastKnownLocation: sos.lastKnownLocation || { type: 'Point', coordinates: [0, 0] },
      message: sos.message || '',
      type: sos.type || '',
      soNo: sos.soNo,
    };
  }
}
