import { IncidentServiceClient } from '@gov-ph/bff-core';
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

  constructor(incidentClient: IncidentServiceClient) {
    this.incidentClient = incidentClient;
  }

  /**
   * Create a new incident
   */
  async createIncident(data: CreateIncidentRequest): Promise<IncidentResponse<IncidentEntity>> {
    try {
      const result = await this.incidentClient.createIncident(data);
      return result;
    } catch (error) {
      console.error('Failed to create incident:', error);
      throw error;
    }
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(incidentId: string): Promise<IncidentResponse<IncidentEntity>> {
    try {
      const incident = await this.incidentClient.getIncidentById(incidentId);
      return incident;
    } catch (error) {
      console.error('Failed to get incident:', error);
      throw error;
    }
  }

  /**
   * Get incidents by city code
   */
  async getIncidentsByCity(
    cityCode: string,
    limit?: number,
    skip?: number
  ): Promise<IncidentResponse<IncidentEntity[]>> {
    try {
      const incidents = await this.incidentClient.getIncidentsByCity(cityCode, limit, skip);
      return incidents;
    } catch (error) {
      console.error('Failed to get incidents by city:', error);
      throw error;
    }
  }

  /**
   * Get incidents by user ID
   */
  async getIncidentsByUserId(
    userId: string,
    limit?: number,
    skip?: number
  ): Promise<IncidentResponse<IncidentEntity[]>> {
    try {
      const incidents = await this.incidentClient.getIncidentsByUserId(userId, limit, skip);
      return incidents;
    } catch (error) {
      console.error('Failed to get incidents by user:', error);
      throw error;
    }
  }

  /**
   * Get all incidents
   */
  async getAllIncidents(
    limit?: number,
    skip?: number
  ): Promise<IncidentResponse<IncidentEntity[]>> {
    try {
      const incidents = await this.incidentClient.getAllIncidents(limit, skip);
      return incidents;
    } catch (error) {
      console.error('Failed to get all incidents:', error);
      throw error;
    }
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus
  ): Promise<IncidentResponse<IncidentEntity>> {
    try {
      const result = await this.incidentClient.updateIncidentStatus(incidentId, status);
      return result;
    } catch (error) {
      console.error('Failed to update incident status:', error);
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
   * Delete incident
   */
  async deleteIncident(incidentId: string): Promise<IncidentResponse<void>> {
    try {
      const result = await this.incidentClient.deleteIncident(incidentId);
      return result;
    } catch (error) {
      console.error('Failed to delete incident:', error);
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
    assignmentId: string
  ): Promise<AssignmentResponse<IncidentAssignmentEntity>> {
    try {
      const result = await this.incidentClient.completeAssignment(assignmentId);
      return result;
    } catch (error) {
      console.error('Failed to complete assignment:', error);
      throw error;
    }
  }
}
