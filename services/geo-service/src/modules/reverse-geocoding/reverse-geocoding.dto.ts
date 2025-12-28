/**
 * Reverse Geocoding DTOs
 * Data Transfer Objects for reverse geocoding endpoints
 */

import { ReverseGeocodeRequest, ReverseGeocodeResult } from './reverse-geocoding.types';

export interface ReverseGeocodeQueryDto extends ReverseGeocodeRequest {}

export interface ReverseGeocodeResponseDto<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  cached?: boolean;
}

export { ReverseGeocodeRequest, ReverseGeocodeResult };
