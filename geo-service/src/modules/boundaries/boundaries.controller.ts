import { Request, Response } from 'express';
import { BoundariesService } from './boundaries.service';
import { ApiResponse, PaginatedResponse } from './boundaries.dto';
import { Province, Municipality, Barangay } from './boundaries.types';

export class BoundariesController {
  private service: BoundariesService;

  constructor() {
    this.service = new BoundariesService();
  }

  /**
   * GET /geo/boundaries/provinces
   * Get all provinces
   */
  async getAllProvinces(req: Request, res: Response): Promise<void> {
    try {
      const provinces = this.service.getAllProvinces();

      const response: ApiResponse<Province[]> = {
        success: true,
        message: 'Provinces retrieved successfully',
        data: provinces,
      };

      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const response: ApiResponse<null> = {
        success: false,
        message: 'Failed to retrieve provinces',
        error: message,
      };
      res.status(500).json(response);
    }
  }

  /**
   * GET /geo/boundaries/municipalities?province=Bulacan
   * Get municipalities by province name
   */
  async getMunicipalitiesByProvince(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { province } = req.query;

      if (!province || typeof province !== 'string') {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Province name is required',
          error: 'Missing or invalid province query parameter',
        };
        res.status(400).json(response);
        return;
      }

      const municipalities = this.service.getMunicipalitiesByProvinceName(
        province
      );

      const response: PaginatedResponse<Municipality> = {
        success: true,
        message: `Municipalities retrieved successfully for province ${province}`,
        data: municipalities,
        total: municipalities.length,
      };

      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const response: ApiResponse<null> = {
        success: false,
        message: 'Failed to retrieve municipalities',
        error: message,
      };
      res.status(500).json(response);
    }
  }

  /**
   * GET /geo/boundaries/barangays?municipalityCode=030140001
   * Get barangays by municipality code
   * If not in DB, load from static data and save to DB
   */
  async getBarangaysByMunicipality(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { municipalityCode } = req.query;

      if (!municipalityCode || typeof municipalityCode !== 'string') {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Municipality code is required',
          error: 'Missing or invalid municipalityCode query parameter',
        };
        res.status(400).json(response);
        return;
      }

      const barangays = await this.service.getBarangaysByMunicipalityCode(
        municipalityCode
      );

      const response: PaginatedResponse<Barangay> = {
        success: true,
        message: `Barangays retrieved successfully for municipality ${municipalityCode}`,
        data: barangays,
        total: barangays.length,
      };

      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const response: ApiResponse<null> = {
        success: false,
        message: 'Failed to retrieve barangays',
        error: message,
      };
      res.status(500).json(response);
    }
  }
}
