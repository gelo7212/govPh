import { SOSRepository } from '../sos/sos.repository';
import { SOS, SOSStatus } from '../sos/sos.model';
import { sosRealtimeClient } from '../../services/sos.realtime.client'
import { eventBus, SOS_EVENTS, SOSStatusChangedEvent } from '../events';

/**
 * Status Machine Service
 * Handles automatic status transitions based on business logic
 */
export class StatusMachineService {
  private ARRIVAL_THRESHOLD_METERS = 20;

  constructor(private repository: SOSRepository) {}

  /**
   * Handles status transition when rescuer is assigned
   * Sets status to EN_ROUTE automatically
   */
  async handleRescuerAssignment(sosId: string, cityId: string, rescuerId: string): Promise<SOS | null> {
    const sos = await this.repository.findById(sosId);
    if (!sos) return null;

    // Only transition from ACTIVE to EN_ROUTE
    if (sos.status !== 'ACTIVE') {
      console.warn(`Cannot assign rescuer to SOS in ${sos.status} status`);
      return sos;
    }

    const updated = await this.repository.update(cityId, sosId, {
      status: 'EN_ROUTE',
      assignedRescuerId: rescuerId,
    });

    // Publish event
    this.publishStatusChange(updated, 'EN_ROUTE', cityId);

    return updated;
  }

  /**
   * Checks distance between rescuer and SOS target location
   * Auto-transitions to ARRIVED if within threshold
   */
  async handleRescuerLocation(
    sosId: string,
    cityId: string,
    rescuerLat: number,
    rescuerLng: number,
  ): Promise<SOS | null> {
    const sos = await this.repository.findById(sosId);
    if (!sos || !sos.assignedRescuerId) return null;

    // Only check distance if in EN_ROUTE status
    if (sos.status !== 'EN_ROUTE') {
      return sos;
    }

    const distance = this.calculateDistance(
      rescuerLat,
      rescuerLng,
      sos.lastKnownLocation.coordinates[1],
      sos.lastKnownLocation.coordinates[0],
    );

    // Auto-transition to ARRIVED if close enough
    if (distance <= this.ARRIVAL_THRESHOLD_METERS) {
      const updated = await this.repository.update(cityId, sosId, {
        status: 'ARRIVED',
      });

      this.publishStatusChange(updated, 'ARRIVED', cityId);
      return updated;
    }

    return sos;
  }

  /**
   * Cancel SOS (only allowed from ACTIVE status)
   */
  async cancelSOS(sosId: string, cityId: string, citizenId: string): Promise<SOS | null> {
    const sos = await this.repository.findById(sosId);
    if (!sos) return null;

    if (sos.status !== 'ACTIVE') {
      throw new Error(`Cannot cancel SOS in ${sos.status} status`);
    }

    const updated = await this.repository.update(cityId, sosId, {
      status: 'CANCELLED',
    });
    let oldStatus = sos.status.toLocaleLowerCase();
    if(oldStatus == 'ACTIVED')
      oldStatus = 'active';
    await sosRealtimeClient.closeSOS(sosId, citizenId);
    this.publishStatusChange(updated, 'CANCELLED', cityId);

    return updated;
  }

  /**
   * Close/Resolve SOS (admin only)
   */
  async closeSOS(sosId: string, cityId: string, resolutionNote?: string): Promise<SOS | null> {
    const sos = await this.repository.findById(sosId);
    if (!sos) return null;

    const updated = await this.repository.update(cityId, sosId, {
      status: 'RESOLVED',
      notes: resolutionNote || sos.message,
    });

    this.publishStatusChange(updated, 'RESOLVED', cityId);

    return updated;
  }

  async updateSOSStatus(sosId: string, status: SOSStatus, resolutionNote?: string): Promise<SOS | null> {
    const sos = await this.repository.findById(sosId);
    if (!sos) return null;

    const updated = await this.repository.updateStatus(sosId, status, resolutionNote);
    console.log(`SOS ${sosId} status updated to ${status}`);
    this.publishStatusChange(updated, status, sos.cityId);

    return updated;
  }

  /**
   * Calculate distance in meters using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Publish status change event
   */
  private publishStatusChange(sos: SOS, newStatus: SOSStatus, cityId: string): void {
    const sosStatusChangedEvent: SOSStatusChangedEvent = {
      sosId: sos.id,
      cityId: cityId,
      previousStatus: sos.status, // Note: You may need to fetch previous status from repo
      newStatus: newStatus,
    };
    eventBus.emit(SOS_EVENTS.STATUS_CHANGED, sosStatusChangedEvent);
  }
}
