/**
 * SOS Domain Events
 * These events are emitted when important SOS state changes occur
 */

export const SOS_EVENTS = {
  // When a new SOS is created
  CREATED: 'sos.created',
  // When SOS status changes
  STATUS_CHANGED: 'sos.status_changed',
  // When SOS location is updated
  LOCATION_UPDATED: 'sos.location_updated',
  // When SOS is tagged
  TAGGED: 'sos.tagged',
  // When SOS is deleted
  DELETED: 'sos.deleted',
} as const;

export interface SOSCreatedEvent {
  sosId: string;
  citizenId?: string;
  cityId: string;
  sosNo: string;
  longitude: number;
  latitude: number;
  message: string;
  type: string;
  address?: {
    city: string;
    barangay: string;
  };
}

export interface SOSStatusChangedEvent {
  sosId: string;
  cityId: string;
  previousStatus: string;
  newStatus: string;
}

export interface SOSLocationUpdatedEvent {
  sosId: string;
  cityId: string;
  longitude: number;
  latitude: number;
  address?: {
    city: string;
    barangay: string;
  };
}

export interface SOSTaggedEvent {
  sosId: string;
  tag: string;
}

export interface SOSDeletedEvent {
  sosId: string;
  cityId: string;
}
