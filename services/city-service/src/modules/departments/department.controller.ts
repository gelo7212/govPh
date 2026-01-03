import { Request, Response } from 'express';
import { DepartmentService } from './department.service';

export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  async getAll(req: Request, res: Response) : Promise<void> {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : undefined,
        cityCode: req.query.cityCode as string | undefined,
      };

      const departments = await this.departmentService.getAllDepartments(
        filters,
      );
      res.json({
        success: true,
        data: departments,
        count: departments.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const department = await this.departmentService.getDepartmentById(
        req.params.id,
      );
      if (!department) {
        res.status(404).json({
          success: false,
          error: 'Department not found',
        });
        return;
      }
      res.json({
        success: true,
        data: department,
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

  async getByCity(req: Request, res: Response): Promise<void> {
    try {
      const sosCapableOnly = req.query.sosCapable === 'true';
      const departments = await this.departmentService.getDepartmentsByCity(
        req.params.cityCode,
        sosCapableOnly,
      );
      res.json({
        success: true,
        data: departments,
        count: departments.length,
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

  async create(req: Request, res: Response): Promise<void> {
    try {
      const department = await this.departmentService.createDepartment(
        req.body,
      );
      res.status(201).json({
        success: true,
        data: department,
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

  async update(req: Request, res: Response): Promise<void> {
    try {
      const department = await this.departmentService.updateDepartment(
        req.params.id,
        req.body,
      );
      if (!department) {
        res.status(404).json({
          success: false,
          error: 'Department not found',
        });
        return;
      }
      res.json({
        success: true,
        data: department,
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
      const department = await this.departmentService.deleteDepartment(
        req.params.id,
      );
      if (!department) {
        res.status(404).json({
          success: false,
          error: 'Department not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Department deleted successfully',
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

  async getByIncidentType(req: Request, res: Response): Promise<void> {
    try {
      const departments =
        await this.departmentService.getDepartmentsByIncidentType(
          req.params.incidentType,
          req.query.cityCode as string | undefined,
        );
      res.json({
        success: true,
        data: departments,
        count: departments.length,
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
}
