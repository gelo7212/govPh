export interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface Location {
  id: string;
  cityId: string;
  sosId: string;
  location: GeoJsonPoint;
  accuracy?: number;
  timestamp: Date;
}
