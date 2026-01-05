import { Request, Response } from 'express';
import { IncidentAggregator } from './incident.aggregator';
import { AssignmentStatus } from '@gov-ph/bff-core/incident/incident.types';
import { getAllReportCategories, getUniqueCategoryTypes, REPORT_CATEGORIES } from '../../utils/report.categories';
import { identifyReportTypeAndSeverity, identifyByKeywords } from '../../utils/reportTypeIdentifier';

/**
 * Incident Controller - Handles HTTP requests for incident operations
 */
export class IncidentController {
  private aggregator: IncidentAggregator;

  constructor(aggregator: IncidentAggregator) {
    this.aggregator = aggregator;
  }

  /**
   * POST /incidents
   * Create a new incident
   */
  async createIncident(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).context?.user?.id;
      const cityCode = (req as any).context?.user?.cityCode;
      const userActor = (req as any).context?.user?.actor;
      if(userActor && userActor.type === 'ANON'){
        throw new Error('Anonymous users cannot create incidents');
      }

      // Identify severity and incident type from report title or keywords
      let typeAndSeverity = { incidentType: 'other', severity: 'low' };
      
      // Try to identify by title first (originalTitle or title field)
      const reportTitle = req.body.originalTitle || req.body.title;
      if (reportTitle) {
        const identified = identifyReportTypeAndSeverity(reportTitle);
        if (identified) {
          typeAndSeverity = identified;
        }
      }
      
      // If not identified by title, try keywords
      if (typeAndSeverity.incidentType === 'other' && typeAndSeverity.severity === 'low') {
        const keywords = REPORT_CATEGORIES.find(rc => rc.title === reportTitle)?.keywords || [];
        if (keywords.length > 0) {
          typeAndSeverity = identifyByKeywords(keywords, reportTitle);
        }
      }

      const incidentData = {
        ...req.body,
        type: typeAndSeverity.incidentType,
        severity: typeAndSeverity.severity,
        reporter: {
          userId: userId || undefined,
          role: userId ? 'citizen' : 'guest',
        },
      };

      const result = await this.aggregator.createIncident(incidentData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
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

  // /**
  //  * GET /incidents/city/:cityCode
  //  * Get incidents by city code
  //  */
  // async getIncidentsByCity(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { cityCode } = req.params;
  //     const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  //     const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

  //     const result = await this.aggregator.getIncidentsByCity(cityCode, limit, skip);
  //     res.json(result);
  //   } catch (error) {
  //     res.status(400).json({ error: (error as Error).message });
  //   }
  // }

  /**
   * GET /incidents/user/:userId
   * Get incidents by user ID
   */
  async getIncidentsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const result = await this.aggregator.getIncidentsByUserId(userId, limit, skip);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /incidents
   * Get all incidents
   */
  async getAllIncidents(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const result = await this.aggregator.getAllIncidents(limit, skip);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * POST /incidents/:id/cancel
  */
    async cancelIncident(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = (req as any).context?.user;
            const actorType = user.actor.type  ? 'citizen' : 'guest';
            const reason = req.body.reason || 'Cancelled by user';
            const result = await this.aggregator.updateIncidentStatus(id, 'cancelled', user?.id || 'system', actorType, reason);
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
      const user = (req as any).context?.user;
      const actorType = user.actor.type  ? 'citizen' : 'guest';
      const reason = req.body.reason || 'Status updated';
      const result = await this.aggregator.updateIncidentStatus(id, status, user?.id || 'system', actorType, reason);
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
   * DELETE /incidents/:id
   * Delete incident
   */
  async deleteIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.aggregator.deleteIncident(id);
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
      const result = await this.aggregator.completeAssignment(id);
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
