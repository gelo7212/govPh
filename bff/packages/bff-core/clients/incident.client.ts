import { IncidentEntity, IncidentResponse } from '../types';
import { BaseClient, UserContext } from './base.client';

/**
 * Incident Service Client
 * Shared client for communicating with the incident-ms microservice
 */
export class IncidentServiceClient extends BaseClient {
  constructor(baseURL: string, userContext?: UserContext) {
    super(baseURL, userContext);
  }

  // ==================== Incident Endpoints ====================

  /**
   * Create a new incident
   */
  async createIncident(data: any): Promise<IncidentResponse<IncidentEntity>> {
    try {
      const response = await this.client.post('/incidents', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(incidentId: string): Promise<IncidentResponse<IncidentEntity>> {
    try {
      const response = await this.client.get(`/incidents/${incidentId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get incidents by city code with filtering and search
   * @param cityCode - The city code to filter by
   * @param filters - Optional filter parameters (search, severity, status, date range, sorting)
   * @param limit - Number of results to return (default: 50)
   * @param skip - Number of results to skip (default: 0)
   */
  async getIncidentsByCity(
    cityCode: string,
    filters?: {
      search?: string;
      severity?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: string;
    },
    limit: number = 50,
    skip: number = 0
  ): Promise<any> {
    try {
      const params: any = { limit, skip };
      
      // Add filter parameters if provided
      if (filters?.search) params.search = filters.search;
      if (filters?.severity) params.severity = filters.severity;
      if (filters?.status) params.status = filters.status;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;
      if (filters?.sortBy) params.sortBy = filters.sortBy;
      if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await this.client.get(`/incidents/city/${cityCode}`, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get incidents by user ID
   */
  async getIncidentsByUserId(userId: string, limit: number = 50, skip: number = 0): Promise<any> {
    try {
      const response = await this.client.get(`/incidents/user/${userId}`, {
        params: { limit, skip },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all incidents
   */
  async getAllIncidents(limit: number = 50, skip: number = 0): Promise<any> {
    try {
      const response = await this.client.get('/incidents', {
        params: { limit, skip },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(
      incidentId: string,
      status: string,
      updatedBy: string,
      actorType: string,
      reason: string,
    ): Promise<any> {
    try {
      const response = await this.client.patch(`/incidents/${incidentId}/status`, 
        { status, updatedBy, actorType, reason });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update incident
   */
  async updateIncident(incidentId: string, data: any): Promise<any> {
    try {
      const response = await this.client.put(`/incidents/${incidentId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete incident
   */
  async deleteIncident(incidentId: string): Promise<any> {
    try {
      const response = await this.client.delete(`/incidents/${incidentId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Assignment Endpoints ====================

  /**
   * Create a new assignment
   */
  async createAssignment(data: any): Promise<any> {
    try {
      const response = await this.client.post('/assignments', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(assignmentId: string): Promise<any> {
    try {
      const response = await this.client.get(`/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get assignments by incident ID
   */
  async getAssignmentsByIncidentId(incidentId: string): Promise<any> {
    try {
      const response = await this.client.get(`/assignments/incident/${incidentId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get assignments by city and department
   */
  async getAssignmentsByCityAndDepartment(
    cityCode: string,
    departmentCode: string,
    status?: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<any> {
    try {
      const response = await this.client.get(
        `/assignments/department/${cityCode}/${departmentCode}`,
        {
          params: { status, limit, skip },
        }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get assignments by responder ID
   */
  async getAssignmentsByResponderId(
    responderId: string,
    status?: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<any> {
    try {
      const response = await this.client.get(`/assignments/responder/${responderId}`, {
        params: { status, limit, skip },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(assignmentId: string, status: string): Promise<any> {
    try {
      const response = await this.client.patch(`/assignments/${assignmentId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Accept assignment
   */
  async acceptAssignment(assignmentId: string): Promise<any> {
    try {
      const response = await this.client.post(`/assignments/${assignmentId}/accept`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Reject assignment
   */
  async rejectAssignment(assignmentId: string, notes?: string): Promise<any> {
    try {
      const response = await this.client.post(`/assignments/${assignmentId}/reject`, { notes });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Complete assignment
   */
  async completeAssignment(assignmentId: string): Promise<any> {
    try {
      const response = await this.client.post(`/assignments/${assignmentId}/complete`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update assignment
   */
  async updateAssignment(assignmentId: string, data: any): Promise<any> {
    try {
      const response = await this.client.put(`/assignments/${assignmentId}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(assignmentId: string): Promise<any> {
    try {
      const response = await this.client.delete(`/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
