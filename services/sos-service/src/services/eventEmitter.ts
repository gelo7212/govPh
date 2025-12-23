import { EventEmitter } from 'events';

export type SOSEventType =
  | 'SOS_CREATED'
  | 'LOCATION_UPDATED'
  | 'MESSAGE_SENT'
  | 'STATUS_CHANGED'
  | 'RESCUER_ASSIGNED'
  | 'SOS_CANCELLED'
  | 'SOS_RESOLVED';

export interface SOSEvent {
  type: SOSEventType;
  sosId: string;
  cityId: string;
  timestamp: Date;
  data: any;
}

/**
 * Centralized event emitter for domain events
 * Controllers emit events, and external systems (sockets, webhooks, etc.) listen
 */
class DomainEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20);
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    console.log(`[Event] ${String(event)}`, args[0]);
    return super.emit(event, ...args);
  }

  publishSOSEvent(event: SOSEvent): void {
    this.emit(event.type, event);
    // Also emit generic event for all listeners
    this.emit('SOS_EVENT', event);
  }

  onSOSCreated(handler: (event: SOSEvent) => void): void {
    this.on('SOS_CREATED', handler);
  }

  onLocationUpdated(handler: (event: SOSEvent) => void): void {
    this.on('LOCATION_UPDATED', handler);
  }

  onMessageSent(handler: (event: SOSEvent) => void): void {
    this.on('MESSAGE_SENT', handler);
  }

  onStatusChanged(handler: (event: SOSEvent) => void): void {
    this.on('STATUS_CHANGED', handler);
  }

  onRescuerAssigned(handler: (event: SOSEvent) => void): void {
    this.on('RESCUER_ASSIGNED', handler);
  }

  onSOSCancelled(handler: (event: SOSEvent) => void): void {
    this.on('SOS_CANCELLED', handler);
  }

  onSOSResolved(handler: (event: SOSEvent) => void): void {
    this.on('SOS_RESOLVED', handler);
  }
}

export const eventEmitter = new DomainEventEmitter();
