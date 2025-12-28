import { Request, Response } from 'express';
import { GeoAggregator } from './geo.aggregator';

export class GeoController {
  private aggregator: GeoAggregator;

  constructor(aggregator: GeoAggregator) {
    this.aggregator = aggregator;
  }

  /**
   * GET /geo/provinces
   * Get all provinces
   */
  async getAllProvinces(req: Request, res: Response): Promise<void> {
    try {
      const provinces = await this.aggregator.getAllProvinces();
      res.json(provinces);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /geo/municipalities?province=<province_name>
   * Get municipalities by province name
   */
  async getMunicipalitiesByProvince(req: Request, res: Response): Promise<void> {
    try {
      const { province } = req.query;
      if (!province || typeof province !== 'string') {
        res.status(400).json({ error: 'Province name is required' });
        return;
      }
      const municipalities = await this.aggregator.getMunicipalitiesByProvince(province);
      res.json(municipalities);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /geo/barangays?municipalityCode=<code>
   * Get barangays by municipality code
   */
  async getBarangaysByMunicipality(req: Request, res: Response): Promise<void> {
    try {
      const { municipalityCode } = req.query;
      if (!municipalityCode || typeof municipalityCode !== 'string') {
        res.status(400).json({ error: 'Municipality code is required' });
        return;
      }
      const barangays = await this.aggregator.getBarangaysByMunicipality(municipalityCode);
      res.json(barangays);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
  /**
 * GET /geo/reverse-geocode?lat=15.0339584&lon=120.6878208
 * Reverse geocode coordinates to address
 * Optional: zoom=18, addressDetails=true
 */
  async reverseGeocode(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lon, zoom, addressDetails } = req.query;
      // Validate required parameters
      if (!lat || !lon) {
        res.status(400).json({ error: 'Both lat and lon query parameters are required' });
        return;
      }
      // Parse and validate coordinates
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const zoomLevel = zoom ? parseInt(zoom as string) : 18;
      const includeAddressDetails = addressDetails !== 'false';
      if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400).json({ error: 'lat and lon must be valid numbers' });
        return;
      }
      const result = await this.aggregator.reverseGeocode(latitude, longitude, zoomLevel, includeAddressDetails);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  } 
}
