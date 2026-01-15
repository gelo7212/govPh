import { Request, Response } from 'express';
import { SosHQService } from './sos-hq.service';
import { IdentityClient } from '../../services/identity.client';
import { DepartmentService } from '../departments/department.service';

export class SosHQController {
  constructor(
    private sosHQService: SosHQService, 
    private identityClient: IdentityClient,
    private departmentClient: DepartmentService,
  ) {}

  private mapLocationToOldFormat(item: any): any {
    if (!item) return item;
    const mapped = { ...item };
    // Map GeoJSON location format to old format
    if (item.location && item.location.type === 'Point' && item.location.coordinates) {
      const [lng, lat] = item.location.coordinates;
      mapped.location = {
        lat,
        lng,
      };
    }
    return mapped;
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userInfo = await this.identityClient.getUserInfo(userId);
      if (!userInfo) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }
      const departments = userInfo.departments || [];
      if (departments.length === 0) {
        res.status(404).json({
          success: false,
          error: 'User has no associated departments',
        });
        return;
      }
      
      const departmentIds = departments.map(dept => dept.id);
      console.log('Department IDs:', departmentIds);
      const departmentsDetails = await this.departmentClient.getDepartmentByIds(departmentIds);
      console.log('Department Details:', departmentsDetails);
      const sosHQList = await this.sosHQService.getSosHQBySupportedDepartmentIds(departmentIds);
      
      // Collect all unique department IDs from all supported departments
      const allSupportedDeptIds = new Set<string>();
      sosHQList.forEach(sosHQ => {
        const supportedDepts = sosHQ.supportedDepartment || [];
        supportedDepts.forEach((dept: any) => {
          allSupportedDeptIds.add(dept.id?.toString() || dept._id?.toString());
        });
      });
      
      // Fetch complete details for all supported departments
      const allSupportedDepts = await this.departmentClient.getDepartmentByIds(
        Array.from(allSupportedDeptIds)
      );
      
      // Create a map for faster lookup
      const deptDetailsMap = new Map(
        allSupportedDepts.map(d => [d._id.toString(), d])
      );
      
      // merge department details into sosHQList :: sosHQ.supportedDepartment
      const mergedDepAndSOSHQ = sosHQList.map(sosHQ => {
        const supportedDepartment = sosHQ.supportedDepartment || [];
        const detailedDepartments = supportedDepartment.map((dept: any) => {
          const deptId = dept.id?.toString() || dept._id?.toString();
          const fullDept = deptDetailsMap.get(deptId);
          return fullDept || dept;
        });
        return {
          ...sosHQ,
          supportedDepartment: detailedDepartments,
        };
      });
      
      const mappedData = mergedDepAndSOSHQ.map(item => this.mapLocationToOldFormat(item));
      res.json({
        success: true,
        data: mappedData,
        count: mappedData.length,
      });
      return;
    }
    catch(error){
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        cityCode: req.query.cityCode as string | undefined,
        provinceCode: req.query.provinceCode as string | undefined,
        scopeLevel: req.query.scopeLevel as 'CITY' | 'PROVINCE' | undefined,
      };

      let sosHQ = await this.sosHQService.getAllSosHQ(filters);
      sosHQ = sosHQ.map(item => this.mapLocationToOldFormat(item));
      res.json({
        success: true,
        data: sosHQ,
        count: sosHQ.length,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      let sosHQ = await this.sosHQService.getSosHQById(req.params.id);
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'SOS HQ not found',
        });
        return;
      }
      sosHQ = this.mapLocationToOldFormat(sosHQ);
      console.log('Mapped SOS HQ:', sosHQ);
      res.json({
        success: true,
        data: sosHQ,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async getByCity(req: Request, res: Response) : Promise<void> {
    try {
      let sosHQ = await this.sosHQService.getSosHQByCity(
        req.params.cityCode,
      );
      sosHQ = sosHQ.map(item => this.mapLocationToOldFormat(item));
      res.json({
        success: true,
        data: sosHQ,
        count: sosHQ.length,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async getByProvince(req: Request, res: Response) : Promise<void> {
    try {
      let sosHQ = await this.sosHQService.getSosHQByProvince(
        req.params.provinceCode,
      );
      sosHQ = sosHQ.map(item => this.mapLocationToOldFormat(item));
      res.json({
        success: true,
        data: sosHQ,
        count: sosHQ.length,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async create(req: Request, res: Response) : Promise<void> {
    try {
      const data = { ...req.body };

      // Map old location format (lat/lng) to new GeoJSON format
      if (data.location && data.location.lat !== undefined && data.location.lng !== undefined) {
        data.location = {
          type: 'Point',
          coordinates: [data.location.lng, data.location.lat], // [longitude, latitude]
        };
      }

      const sosHQ = await this.sosHQService.createSosHQ(data);
      res.status(201).json({
        success: true,
        data: sosHQ,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async update(req: Request, res: Response) : Promise<void> {
    try {
      const data = { ...req.body };

      // Map old location format (lat/lng) to new GeoJSON format
      if (data.location && data.location.lat !== undefined && data.location.lng !== undefined) {
        data.location = {
          type: 'Point',
          coordinates: [data.location.lng, data.location.lat], // [longitude, latitude]
        };
      }

      const sosHQ = await this.sosHQService.updateSosHQ(
        req.params.id,
        data,
      );
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'SOS HQ not found',
        });
        return;
      }
      res.json({
        success: true,
        data: sosHQ,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const sosHQ = await this.sosHQService.deleteSosHQ(req.params.id);
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'SOS HQ not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'SOS HQ deleted successfully',
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async activate(req: Request, res: Response): Promise<void> {
    try {
      const sosHQ = await this.sosHQService.activateSosHQ(req.params.id);
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'SOS HQ not found',
        });
        return;
      }
      res.json({
        success: true,
        data: sosHQ,
        message: 'SOS HQ activated successfully',
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const sosHQ = await this.sosHQService.deactivateSosHQ(req.params.id);
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'SOS HQ not found',
        });
        return;
      }
      res.json({
        success: true,
        data: sosHQ,
        message: 'SOS HQ deactivated successfully',
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  async getNearestSosHQ(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng } = req.query;
      if (!lat || !lng) {
        res.status(400).json({
          success: false,
          error: 'Latitude and Longitude are required',
        });
        return;
      }
      let sosHQ = await this.sosHQService.getNearestSosHQ(
        parseFloat(lat as string),
        parseFloat(lng as string),
      );
      if (!sosHQ) {
        res.status(404).json({
          success: false,
          error: 'No SOS HQ found nearby',
        });
        return;
      }
      sosHQ = this.mapLocationToOldFormat(sosHQ);
      console.log(sosHQ);
      res.json({
        success: true,
        data: sosHQ,
      });
      return;
    }
    catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }
}
