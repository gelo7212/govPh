/**
 * Reverse Geocoding Types
 * Types for OpenStreetMap Nominatim reverse geocoding API
 */

export interface ReverseGeocodeRequest {
  lat: number;
  lon: number;
  zoom?: number;        // Optional: detail level (default: 18)
  addressDetails?: boolean; // Optional: return detailed address breakdown (default: true)
}

export interface Address {
  office?: string;
  road?: string;
  neighbourhood?: string;
  quarter?: string;
  suburb?: string;
  village?: string;
  city?: string;
  town?: string;
  state?: string;
  region?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  [key: string]: string | undefined;
}

export interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name?: string;
  display_name: string;
  address: Address;
  boundingbox: string[];
}

export interface ReverseGeocodeResult {
  placeId: number;
  name?: string;
  displayName: string;
  latitude: string;
  longitude: string;
  osmType: string;
  osmId: number;
  addressType: string;
  address: Address;
  boundingBox: {
    north: string;
    south: string;
    east: string;
    west: string;
  };
}

export interface ReverseGeocodeCache {
  lat: string;
  lon: string;
  result: ReverseGeocodeResult;
  cachedAt: number;
  expiresAt: number;
}
