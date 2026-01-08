import { Request, Response } from 'express';
import { IncidentAggregator } from './incident.aggregator';
import { AssignmentStatus } from '@gov-ph/bff-core/incident/incident.types';
import { getAllReportCategories, getUniqueCategoryTypes } from './report.categories';

/**
 * Incident Controller - Handles HTTP requests for incident operations
 */
export class IncidentController {
  private aggregator: IncidentAggregator;

  constructor(aggregator: IncidentAggregator) {
    this.aggregator = aggregator;
  }

  /**
   * GET /incidents/:id
   * Get incident by ID
   */
  async getIncidentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.getIncidentById(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /incidents/city/:cityCode
   * Get incidents by city code with filtering and search
   * Query Parameters:
   *   - search: text search in title/description (case-insensitive)
   *   - severity: filter by severity (low|medium|high)
   *   - status: filter by status (open|acknowledged|in_progress|resolved|rejected|cancelled)
   *   - startDate: filter incidents from this date (ISO 8601)
   *   - endDate: filter incidents until this date (ISO 8601)
   *   - sortBy: sort by field (severity|status|title|createdAt). Default: createdAt
   *   - sortOrder: sort order (asc|desc). Default: desc
   *   - limit: pagination limit. Default: 50
   *   - skip: pagination skip. Default: 0
   */
  async getIncidentsByCity(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode } = req.params;
      const filters = {
        search: req.query.search as string | undefined,
        severity: req.query.severity as string | undefined,
        status: req.query.status as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as string) || 'desc',
      };
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const result = await this.aggregator.getIncidentsByCity(cityCode, filters, limit, skip);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getIncidentByDepartmentId(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId } = req.params;
      const { status, limit, skip } = req.query;
      const result = await this.aggregator.getIncidentByDepartmentId(departmentId, status as string, limit ? parseInt(limit as string) : 50, skip ? parseInt(skip as string) : 0);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * PATCH /incidents/:id/status
   * Update incident status
   */
  async updateIncidentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.context?.user;
      const updatedBy = user?.id;
      const actorType = 'admin';
      const reason = req.body.reason || 'Status updated';

      if(!updatedBy || !actorType) {
        throw new Error('Unauthorized: User information is missing');
      }

      const result = await this.aggregator.updateIncidentStatus(id, status, updatedBy, actorType, reason);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * PUT /incidents/:id
   * Update incident
   */
  async updateIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.updateIncident(id, req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * POST /assignments
   * Create assignment
   */
  async createAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignmentData = req.body;
      const user = req.context?.user;
      if(!user) {
        throw new Error('Unauthorized: User information is missing');
      }
      assignmentData.assignedBy = user.id;
      assignmentData.departmentCode = assignmentData?.departmentId || assignmentData.departmentCode;
      const result = await this.aggregator.createAssignment(assignmentData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /assignments/:id
   * Get assignment by ID
   */
  async getAssignmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.getAssignmentById(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /assignments/incident/:incidentId
   * Get assignments by incident ID
   */
  async getAssignmentsByIncidentId(req: Request, res: Response): Promise<void> {
    try {
      const { incidentId } = req.params;
      const result = await this.aggregator.getAssignmentsByIncidentId(incidentId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /assignments/department/:cityCode/:departmentCode
   * Get assignments by city and department
   */
  async getAssignmentsByCityAndDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { cityCode, departmentCode } = req.params;
      const status = req.query.status as AssignmentStatus | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const result = await this.aggregator.getAssignmentsByCityAndDepartment(
        cityCode,
        departmentCode,
        status,
        limit,
        skip
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /assignments/responder/:responderId
   * Get assignments by responder ID
   */
  async getAssignmentsByResponderId(req: Request, res: Response): Promise<void> {
    try {
      const { responderId } = req.params;
      const status = req.query.status as AssignmentStatus | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const result = await this.aggregator.getAssignmentsByResponderId(
        responderId,
        status,
        limit,
        skip
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * POST /assignments/:id/accept
   * Accept assignment
   */
  async acceptAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.acceptAssignment(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * POST /assignments/:id/reject
   * Reject assignment
   */
  async rejectAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const result = await this.aggregator.rejectAssignment(id, notes);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * POST /assignments/:id/complete
   * Complete assignment
   */
  async completeAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const result = await this.aggregator.completeAssignment(id, notes);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /reports/lookup
   * Get all available report categories for lookup/autocomplete
   */
  async getReportCategoriesLookup(req: Request, res: Response): Promise<void> {
    try {
      const { category, suggestion } = req.query;

      let reportCategories = getAllReportCategories();

      // Filter by category type if provided
      if (category && typeof category === 'string') {
        reportCategories = reportCategories.filter(
          (r) => r.category.toLowerCase() === category.toLowerCase()
        );
      }

      // Filter by suggestion flag if provided
      if (suggestion !== undefined) {
        const suggestionBool = suggestion === 'true';
        reportCategories = reportCategories.filter(
          (r) => r.suggestion === suggestionBool
        );
      }

      res.json({
        data: reportCategories,
        total: reportCategories.length,
        categories: getUniqueCategoryTypes(),
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
