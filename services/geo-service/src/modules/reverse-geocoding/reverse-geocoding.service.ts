/**
 * Reverse Geocoding Service
 * Handles reverse geocoding requests using OpenStreetMap's Nominatim API with Redis caching
 */

import axios, { AxiosInstance } from 'axios';
import { NOMINATIM_CONFIG } from './reverse-geocoding.config';
import {
  ReverseGeocodeRequest,
  ReverseGeocodeResult,
  NominatimResponse,
  ReverseGeocodeCache,
} from './reverse-geocoding.types';
import { logger } from '../../utils/logger';

export class ReverseGeocodingService {
  private nominatimClient: AxiosInstance;
  private readonly CACHE_TTL = 86400; // 24 hours in seconds
  private readonly CACHE_KEY_PREFIX = 'reverse_geocode:';

  constructor(private redisClient?: any) {
    this.nominatimClient = axios.create({
      baseURL: NOMINATIM_CONFIG.BASE_URL,
      timeout: NOMINATIM_CONFIG.TIMEOUT,
      headers: {
        'User-Agent': NOMINATIM_CONFIG.USER_AGENT,
      },
    });
  }

  /**
   * Set Redis client for caching
   */
  setRedisClient(client: any): void {
    this.redisClient = client;
  }

  /**
   * Generate cache key from coordinates
   */
  private generateCacheKey(lat: number, lon: number): string {
    // Round to 6 decimal places for cache key consistency (precision: ~0.1 meters)
    const roundedLat = Math.round(lat * 1000000) / 1000000;
    const roundedLon = Math.round(lon * 1000000) / 1000000;
    return `${this.CACHE_KEY_PREFIX}${roundedLat}:${roundedLon}`;
  }

  /**
   * Get cached result from Redis
   */
  private async getFromCache(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
    if (!this.redisClient) {
      return null;
    }

    try {
      const cacheKey = this.generateCacheKey(lat, lon);
      const cached = await this.redisClient.get(cacheKey);

      if (cached) {
        const cacheData: ReverseGeocodeCache = JSON.parse(cached);

        // Check if cache is still valid
        if (cacheData.expiresAt > Date.now()) {
          logger.info(`Cache hit for reverse geocoding: ${cacheKey}`);
          return cacheData.result;
        }

        // Cache expired, delete it
        await this.redisClient.del(cacheKey);
      }
    } catch (error) {
      logger.error('Error retrieving from cache:', error);
      // Continue without cache on error
    }

    return null;
  }

  /**
   * Store result in Redis cache
   */
  private async storeInCache(lat: number, lon: number, result: ReverseGeocodeResult): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      const cacheKey = this.generateCacheKey(lat, lon);
      const cacheData: ReverseGeocodeCache = {
        lat: result.latitude,
        lon: result.longitude,
        result,
        cachedAt: Date.now(),
        expiresAt: Date.now() + this.CACHE_TTL * 1000,
      };

      await this.redisClient.setEx(
        cacheKey,
        this.CACHE_TTL,
        JSON.stringify(cacheData)
      );

      logger.info(`Cached reverse geocoding result: ${cacheKey}`);
    } catch (error) {
      logger.error('Error storing in cache:', error);
      // Continue without cache on error
    }
  }

  /**
   * Transform Nominatim API response to our format
   */
  private transformResponse(nominatimResponse: NominatimResponse): ReverseGeocodeResult {
    const [south, north, west, east] = nominatimResponse.boundingbox;

    return {
      placeId: nominatimResponse.place_id,
      name: nominatimResponse.name,
      displayName: nominatimResponse.display_name,
      latitude: nominatimResponse.lat,
      longitude: nominatimResponse.lon,
      osmType: nominatimResponse.osm_type,
      osmId: nominatimResponse.osm_id,
      addressType: nominatimResponse.addresstype,
      address: nominatimResponse.address,
      boundingBox: {
        north,
        south,
        east,
        west,
      },
    };
  }

  /**
   * Perform reverse geocoding with caching
   * Converts latitude and longitude to address information
   */
  async reverseGeocode(request: ReverseGeocodeRequest): Promise<ReverseGeocodeResult> {
    const { lat, lon, zoom = 18, addressDetails = true } = request;

    // Validate coordinates
    if (!this.isValidCoordinates(lat, lon)) {
      throw new Error(
        `Invalid coordinates: lat must be between -90 and 90, lon must be between -180 and 180. Received: lat=${lat}, lon=${lon}`
      );
    }

    // Check cache first
    const cachedResult = await this.getFromCache(lat, lon);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      logger.info(`Calling Nominatim API for reverse geocoding: lat=${lat}, lon=${lon}`);

      const response = await this.nominatimClient.get<NominatimResponse>('/reverse', {
        params: {
          format: 'json',
          lat,
          lon,
          zoom,
          addressdetails: addressDetails ? 1 : 0,
        },
      });

      const result = this.transformResponse(response.data);

      // Cache the result
      await this.storeInCache(lat, lon, result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Nominatim API error during reverse geocoding: ${errorMessage}`, error);

      throw new Error(`Failed to reverse geocode coordinates (${lat}, ${lon}): ${errorMessage}`);
    }
  }

  /**
   * Validate latitude and longitude coordinates
   */
  private isValidCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  /**
   * Clear cache for specific coordinates
   */
  async clearCache(lat: number, lon: number): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      const cacheKey = this.generateCacheKey(lat, lon);
      await this.redisClient.del(cacheKey);
      logger.info(`Cleared cache for coordinates: ${cacheKey}`);
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }

  /**
   * Clear all reverse geocoding cache
   */
  async clearAllCache(): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      const keys = await this.redisClient.keys(`${this.CACHE_KEY_PREFIX}*`);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
        logger.info(`Cleared ${keys.length} reverse geocoding cache entries`);
      }
    } catch (error) {
      logger.error('Error clearing all cache:', error);
    }
  }
}
