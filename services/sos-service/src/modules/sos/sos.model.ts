export type SOSStatus = 'ACTIVE' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED' | 'CANCELLED';

export interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface SOS {
  id: string;
  cityId: string;
  citizenId: string;
  status: SOSStatus;
  assignedRescuerId?: string;
  lastKnownLocation: GeoJsonPoint;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  message: string;
  soNo: string;
}
