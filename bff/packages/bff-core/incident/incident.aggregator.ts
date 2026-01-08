import { IncidentServiceClient } from '../clients';
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
} from './incident.types';

/**
 * Incident Aggregator - Shared orchestration layer
 * Handles incident management across all BFF services
 */
export class IncidentAggregator {
  constructor(private incidentClient: IncidentServiceClient) {}

  // ==================== Incident Operations ====================

  /**
   * Create a new incident
   */
  async createIncident(data: CreateIncidentRequest): Promise<IncidentResponse<IncidentEntity>> {
    const result = await this.incidentClient.createIncident(data);
    return result;
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(incidentId: string): Promise<IncidentResponse<IncidentEntity>> {
    const incident = await this.incidentClient.getIncidentById(incidentId);
    return incident;
  }

  /**
   * Get incidents by city code
   */
  async getIncidentsByCity(
    cityCode: string,
    limit?: number,
    filters?: any,
    skip?: number
  ): Promise<IncidentResponse<IncidentEntity[]>> {
    const incidents = await this.incidentClient.getIncidentsByCity(cityCode,filters, limit, skip);
    return incidents;
  }

  /**
   * Get incidents by user ID
   */
  async getIncidentsByUserId(
    userId: string,
    limit?: number,
    skip?: number
  ): Promise<IncidentResponse<IncidentEntity[]>> {
    const incidents = await this.incidentClient.getIncidentsByUserId(userId, limit, skip);
    return incidents;
  }

  /**
   * Get all incidents
   */
  async getAllIncidents(
    limit?: number,
    skip?: number
  ): Promise<IncidentResponse<IncidentEntity[]>> {
    const incidents = await this.incidentClient.getAllIncidents(limit, skip);
    return incidents;
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
    const result = await this.incidentClient.updateIncidentStatus(incidentId, status, updatedBy, actorType, reason);
    return result;
  }

  /**
   * Update incident
   */
  async updateIncident(
    incidentId: string,
    data: UpdateIncidentRequest
  ): Promise<IncidentResponse<IncidentEntity>> {
    const result = await this.incidentClient.updateIncident(incidentId, data);
    return result;
  }

  /**
   * Delete incident
   */
  async deleteIncident(incidentId: string): Promise<IncidentResponse<void>> {
    const result = await this.incidentClient.deleteIncident(incidentId);
    return result;
  }

  // ==================== Assignment Operations ====================

  /**
   * Create a new assignment
   */
  async createAssignment(
    data: CreateAssignmentRequest
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    const result = await this.incidentClient.createAssignment(data);
    return result;
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(
    assignmentId: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    const assignment = await this.incidentClient.getAssignmentById(assignmentId);
    return assignment;
  }

  /**
   * Get assignments by incident ID
   */
  async getAssignmentsByIncidentId(
    incidentId: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity[]>> {
    const assignments = await this.incidentClient.getAssignmentsByIncidentId(incidentId);
    return assignments;
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
    const assignments = await this.incidentClient.getAssignmentsByCityAndDepartment(
      cityCode,
      departmentCode,
      status,
      limit,
      skip
    );
    return assignments;
  }

  async getAssignmentsByDepartmentId(
    departmentId: string,
    status: string,
    limit: number,
    skip: number
  ): Promise<AssignmentResponse<IncidentAssignmentEntity[]>> {
    const assignments = await this.incidentClient.getIncidentByDepartmentId(
      departmentId,
      status,
      limit,
      skip
    );
    return assignments;
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
    const assignments = await this.incidentClient.getAssignmentsByResponderId(
      responderId,
      status,
      limit,
      skip
    );
    return assignments;
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(
    assignmentId: string,
    status: AssignmentStatus
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    const result = await this.incidentClient.updateAssignmentStatus(assignmentId, status);
    return result;
  }

  /**
   * Accept assignment
   */
  async acceptAssignment(
    assignmentId: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    const result = await this.incidentClient.acceptAssignment(assignmentId);
    return result;
  }

  /**
   * Reject assignment
   */
  async rejectAssignment(
    assignmentId: string,
    notes?: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    const result = await this.incidentClient.rejectAssignment(assignmentId, notes);
    return result;
  }

  /**
   * Complete assignment
   */
  async completeAssignment(
    assignmentId: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    const result = await this.incidentClient.completeAssignment(assignmentId);
    return result;
  }

  /**
   * Update assignment
   */
  async updateAssignment(
    assignmentId: string,
    data: UpdateAssignmentRequest
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    const result = await this.incidentClient.updateAssignment(assignmentId, data);
    return result;
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(assignmentId: string): Promise<AssignmentResponse<void>> {
    const result = await this.incidentClient.deleteAssignment(assignmentId);
    return result;
  }
}
