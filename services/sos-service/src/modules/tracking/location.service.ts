import { LocationModel, ILocation } from './location.mongo.schema';
import { Location } from './location.model';

export class LocationService {
  async updateLocation(data: any): Promise<Location> {
    const location = await LocationModel.create({
      cityId: data.cityId,
      sosId: data.sosId,
      location: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      },
      accuracy: data.accuracy,
    });
    return this.mapToDTO(location);
  }

  async getLocationHistory(cityId: string, sosId: string): Promise<Location[]> {
    const locations = await LocationModel.find({ cityId, sosId }).sort({ timestamp: 1 });
    return locations.map((loc) => this.mapToDTO(loc));
  }

  async getLatestLocation(cityId: string, sosId: string): Promise<Location | null> {
    const location = await LocationModel.findOne({ cityId, sosId }).sort({ timestamp: -1 });
    if (!location) return null;
    return this.mapToDTO(location);
  }

  async deleteLocationsBySOS(cityId: string, sosId: string): Promise<void> {
    await LocationModel.deleteMany({ cityId, sosId });
  }

  private mapToDTO(location: ILocation): Location {
    return {
      id: location._id?.toString() || '',
      cityId: location.cityId,
      sosId: location.sosId,
      location: location.location,
      accuracy: location.accuracy,
      timestamp: location.timestamp,
    };
  }
}
