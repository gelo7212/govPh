import { IncidentServiceClient, IncidentTimelineServiceClient} from '@gov-ph/bff-core';
import {
  IncidentEntity,
  IncidentAssignmentEntity,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  IncidentResponse,
  AssignmentResponse,
  IncidentStatus,
  AssignmentStatus,
} from '@gov-ph/bff-core/incident/incident.types';

/**
 * Incident Aggregator - Orchestrates Incident operations
 * This aggregator handles creation, retrieval, and management of incidents
 */
export class IncidentAggregator {
  private incidentClient: IncidentServiceClient;
  private incidentTimelineClient: IncidentTimelineServiceClient;

  constructor(incidentClient: IncidentServiceClient, incidentTimelineClient: IncidentTimelineServiceClient) {
    this.incidentClient = incidentClient;
    this.incidentTimelineClient = incidentTimelineClient;
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(incidentId: string): Promise<IncidentResponse<IncidentEntity>> {
    try {
      const incident = await this.incidentClient.getIncidentById(incidentId);
      const timeline = await this.incidentTimelineClient.getTimelineByIncidentId(incidentId);
      incident.data.timeline = timeline.data;
      return incident;
    } catch (error) {
      console.error('Failed to get incident:', error);
      throw error;
    }
  }

  /**
   * Get incidents by city code with filtering and search
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
    limit?: number,
    skip?: number
  ): Promise<IncidentResponse<IncidentEntity[]>> {
    try {
      const incidents = await this.incidentClient.getIncidentsByCity(cityCode, filters, limit, skip);
      return incidents;
    } catch (error) {
      console.error('Failed to get incidents by city:', error);
      throw error;
    }
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    updatedBy: string,
    actorType: string,
    reason: string
  ): Promise<IncidentResponse<IncidentEntity>> {
    try {
      const result = await this.incidentClient.updateIncidentStatus(incidentId, status, updatedBy, actorType, reason);
      return result;
    } catch (error) {
      console.error('Failed to update incident status:', error);
      throw error;
    }
  }

  async getIncidentByDepartmentId(
    departmentId: string,
    status: string,
    limit: number,
    skip: number
  ): Promise<IncidentResponse<IncidentEntity[]>> {
    try {

      const result = await this.incidentClient.getIncidentByDepartmentId(
        departmentId,
        status,
        limit,
        skip

      );
      return result;
    }
    catch (error) {
      console.error('Failed to get incidents by department ID:', error);
      throw error;
    }
  }

  /**
   * Update incident
   */
  async updateIncident(
    incidentId: string,
    data: UpdateIncidentRequest
  ): Promise<IncidentResponse<IncidentEntity>> {
    try {
      const result = await this.incidentClient.updateIncident(incidentId, data);
      return result;
    } catch (error) {
      console.error('Failed to update incident:', error);
      throw error;
    }
  }

  /**
   * Create a new assignment
   */
  async createAssignment(
    data: CreateAssignmentRequest
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    try {
      const result = await this.incidentClient.createAssignment(data);
      return result;
    } catch (error) {
      console.error('Failed to create assignment:', error);
      throw error;
    }
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(
    assignmentId: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    try {
      const assignment = await this.incidentClient.getAssignmentById(assignmentId);
      return assignment;
    } catch (error) {
      console.error('Failed to get assignment:', error);
      throw error;
    }
  }

  /**
   * Get assignments by incident ID
   */
  async getAssignmentsByIncidentId(
    incidentId: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity[]>> {
    try {
      const assignments = await this.incidentClient.getAssignmentsByIncidentId(incidentId);
      return assignments;
    } catch (error) {
      console.error('Failed to get assignments by incident:', error);
      throw error;
    }
  }

  /**
   * Get assignments by city and department
   */
  async getAssignmentsByCityAndDepartment(
    cityCode: string,
    departmentCode: string,
    status?: AssignmentStatus,
    limit?: number,
    skip?: number
  ): Promise<AssignmentResponse<IncidentAssignmentEntity[]>> {
    try {
      const assignments = await this.incidentClient.getAssignmentsByCityAndDepartment(
        cityCode,
        departmentCode,
        status,
        limit,
        skip
      );
      return assignments;
    } catch (error) {
      console.error('Failed to get assignments by city/department:', error);
      throw error;
    }
  }

  /**
   * Get assignments by responder ID
   */
  async getAssignmentsByResponderId(
    responderId: string,
    status?: AssignmentStatus,
    limit?: number,
    skip?: number
  ): Promise<AssignmentResponse<IncidentAssignmentEntity[]>> {
    try {
      const assignments = await this.incidentClient.getAssignmentsByResponderId(
        responderId,
        status,
        limit,
        skip
      );
      return assignments;
    } catch (error) {
      console.error('Failed to get assignments by responder:', error);
      throw error;
    }
  }

  /**
   * Accept assignment
   */
  async acceptAssignment(
    assignmentId: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    try {
      const result = await this.incidentClient.acceptAssignment(assignmentId);
      return result;
    } catch (error) {
      console.error('Failed to accept assignment:', error);
      throw error;
    }
  }

  /**
   * Reject assignment
   */
  async rejectAssignment(
    assignmentId: string,
    notes?: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    try {
      const result = await this.incidentClient.rejectAssignment(assignmentId, notes);
      return result;
    } catch (error) {
      console.error('Failed to reject assignment:', error);
      throw error;
    }
  }

  /**
   * Complete assignment
   */
  async completeAssignment(
    assignmentId: string,
    notes?: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    try {
      const result = await this.incidentClient.completeAssignment(assignmentId, notes);
      return result;
    } catch (error) {
      console.error('Failed to complete assignment:', error);
      throw error;
    }
  }
}
