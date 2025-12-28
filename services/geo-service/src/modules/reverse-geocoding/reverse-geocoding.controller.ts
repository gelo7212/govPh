/**
 * Reverse Geocoding Controller
 * Handles reverse geocoding requests
 */

import { Request, Response } from 'express';
import { ReverseGeocodingService } from './reverse-geocoding.service';
import { ReverseGeocodeResponseDto, ReverseGeocodeRequest } from './reverse-geocoding.dto';

export class ReverseGeocodingController {
  private service: ReverseGeocodingService;

  constructor() {
    this.service = new ReverseGeocodingService();
  }

  /**
   * Set Redis client for caching (called during app initialization)
   */
  setRedisClient(client: any): void {
    this.service.setRedisClient(client);
  }

  /**
   * POST /geo/reverse-geocode
   * Reverse geocode coordinates to address
   *
   * Query/Body Parameters:
   * - lat (number, required): Latitude (-90 to 90)
   * - lon (number, required): Longitude (-180 to 180)
   * - zoom (number, optional): Detail level (0-18, default: 18)
   * - addressDetails (boolean, optional): Return detailed address breakdown (default: true)
   *
   * Example:
   * POST /geo/reverse-geocode?lat=15.0339584&lon=120.6878208
   */
  async reverseGeocode(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lon, zoom, addressDetails } = req.query;

      // Validate required parameters
      if (!lat || !lon) {
        const response: ReverseGeocodeResponseDto<null> = {
          success: false,
          message: 'Missing required parameters',
          error: 'Both lat and lon query parameters are required',
        };
        res.status(400).json(response);
        return;
      }

      // Parse and validate coordinates
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const zoomLevel = zoom ? parseInt(zoom as string) : 18;
      const includeAddressDetails = addressDetails !== 'false';

      if (isNaN(latitude) || isNaN(longitude)) {
        const response: ReverseGeocodeResponseDto<null> = {
          success: false,
          message: 'Invalid parameters',
          error: 'lat and lon must be valid numbers',
        };
        res.status(400).json(response);
        return;
      }

      // Call service
      const geocodeRequest: ReverseGeocodeRequest = {
        lat: latitude,
        lon: longitude,
        zoom: zoomLevel,
        addressDetails: includeAddressDetails,
      };

      const result = await this.service.reverseGeocode(geocodeRequest);

      const response: ReverseGeocodeResponseDto<typeof result> = {
        success: true,
        message: 'Reverse geocoding completed successfully',
        data: result,
        cached: false, // In a full implementation, track if result was from cache
      };

      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      const response: ReverseGeocodeResponseDto<null> = {
        success: false,
        message: 'Failed to perform reverse geocoding',
        error: message,
      };

      res.status(500).json(response);
    }
  }

  /**
   * DELETE /geo/reverse-geocode/cache?lat=15.0339584&lon=120.6878208
   * Clear cache for specific coordinates
   *
   * Query Parameters:
   * - lat (number, required): Latitude
   * - lon (number, required): Longitude
   */
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        const response: ReverseGeocodeResponseDto<null> = {
          success: false,
          message: 'Missing required parameters',
          error: 'Both lat and lon query parameters are required',
        };
        res.status(400).json(response);
        return;
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);

      if (isNaN(latitude) || isNaN(longitude)) {
        const response: ReverseGeocodeResponseDto<null> = {
          success: false,
          message: 'Invalid parameters',
          error: 'lat and lon must be valid numbers',
        };
        res.status(400).json(response);
        return;
      }

      await this.service.clearCache(latitude, longitude);

      const response: ReverseGeocodeResponseDto<null> = {
        success: true,
        message: 'Cache cleared successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      const response: ReverseGeocodeResponseDto<null> = {
        success: false,
        message: 'Failed to clear cache',
        error: message,
      };

      res.status(500).json(response);
    }
  }

  /**
   * DELETE /geo/reverse-geocode/cache-all
   * Clear all reverse geocoding cache
   */
  async clearAllCache(req: Request, res: Response): Promise<void> {
    try {
      await this.service.clearAllCache();

      const response: ReverseGeocodeResponseDto<null> = {
        success: true,
        message: 'All reverse geocoding cache cleared successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      const response: ReverseGeocodeResponseDto<null> = {
        success: false,
        message: 'Failed to clear cache',
        error: message,
      };

      res.status(500).json(response);
    }
  }
}
