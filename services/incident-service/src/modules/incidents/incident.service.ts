import { IncidentEntity, IncidentStatus } from '../../types';
import { incidentRepository } from './incident.repository';
import { ValidationError, NotFoundError } from '../../errors';
import {
  validateIncidentCreationPayload,
  validateIncidentStatus,
} from '../../utils/validators';
import { createLogger } from '../../utils/logger';

import { incidentTimelineService} from '../incident-timelines'

const logger = createLogger('IncidentService');

/**
 * Incident Service - Business logic layer
 */
export class IncidentService {
  /**
   * Create a new incident
   */
  async createIncident(incidentData: IncidentEntity): Promise<IncidentEntity> {
    try {
      validateIncidentCreationPayload(incidentData);
      logger.info('Creating incident', {
        type: incidentData.type,
        severity: incidentData.severity,
      });
      const incident = await incidentRepository.createIncident(incidentData);
      if(!incident) {
        throw new Error('Incident creation failed');
      }

      await incidentTimelineService.logIncidentCreatedEvent(
        incident.id!,
        incident.reporter.userId!,
        incident.reporter.role!,
        'citizen_app',
        incident.reporter.userId ? false : true
      );
      return incident;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('Error creating incident', error);
      throw error;
    }
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(incidentId: string): Promise<IncidentEntity> {
    try {
      return await incidentRepository.getIncidentById(incidentId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Error retrieving incident', error);
      throw error;
    }
  }

  /**
   * Get incidents by city
   */
  async getIncidentsByCity(
    cityCode: string,
    limit?: number,
    skip?: number
  ): Promise<IncidentEntity[]> {
    try {
      return await incidentRepository.getIncidentsByCity(
        cityCode,
        limit,
        skip
      );
    } catch (error) {
      logger.error('Error retrieving incidents by city', error);
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
  ): Promise<IncidentEntity[]> {
    try {
      return await incidentRepository.getIncidentsByUserId(
        userId,
        limit,
        skip
      );
    } catch (error) {
      logger.error('Error retrieving incidents by user', error);
      throw error;
    }
  }

  /**
   * Get all incidents
   */
  async getAllIncidents(
    limit?: number,
    skip?: number
  ): Promise<IncidentEntity[]> {
    try {
      return await incidentRepository.getAllIncidents(limit, skip);
    } catch (error) {
      logger.error('Error retrieving all incidents', error);
      throw error;
    }
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus
  ): Promise<IncidentEntity> {
    try {
      validateIncidentStatus(status);
      
      // Get current incident to validate transition
      const incident = await incidentRepository.getIncidentById(incidentId);
      
      // Validate status transition
      this.validateStatusTransition(incident.status, status);
      
      logger.info('Updating incident status', {
        incidentId,
        from: incident.status,
        to: status,
      });
      
      return await incidentRepository.updateIncidentStatus(incidentId, status);
    } catch (error) {
      logger.error('Error updating incident status', error);
      throw error;
    }
  }

  /**
   * Update incident
   */
  async updateIncident(
    incidentId: string,
    updates: Partial<IncidentEntity>
  ): Promise<IncidentEntity> {
    try {
      await this.getIncidentById(incidentId); // Verify exists
      logger.info('Updating incident', { incidentId });
      return await incidentRepository.updateIncident(incidentId, updates);
    } catch (error) {
      logger.error('Error updating incident', error);
      throw error;
    }
  }

  /**
   * Delete incident
   */
  async deleteIncident(incidentId: string): Promise<void> {
    try {
      await this.getIncidentById(incidentId); // Verify exists
      logger.info('Deleting incident', { incidentId });
      await incidentRepository.deleteIncident(incidentId);
    } catch (error) {
      logger.error('Error deleting incident', error);
      throw error;
    }
  }

  /**
   * Get incident count by city
   */
  async getIncidentCountByCity(cityCode: string): Promise<number> {
    try {
      return await incidentRepository.getIncidentCountByCity(cityCode);
    } catch (error) {
      logger.error('Error counting incidents', error);
      throw error;
    }
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(
    currentStatus: IncidentStatus,
    newStatus: IncidentStatus
  ): void {
    // Define valid transitions
    const validTransitions: Record<IncidentStatus, IncidentStatus[]> = {
      open: ['acknowledged', 'rejected'],
      acknowledged: ['in_progress', 'rejected'],
      in_progress: ['resolved', 'rejected'],
      resolved: [],
      rejected: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition from '${currentStatus}' to '${newStatus}'`
      );
    }
  }
}

// Export singleton instance
export const incidentService = new IncidentService();
