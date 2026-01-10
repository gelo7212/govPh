import { EventEmitter } from 'events';

export interface DomainEvent {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
}

export class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    // Increase max listeners to prevent warnings
    this.emitter.setMaxListeners(100);
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   * @param eventType - The event type to subscribe to
   * @param handler - The handler function
   */
  on(eventType: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    this.emitter.on(eventType, async (event: DomainEvent) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
      }
    });
  }

  /**
   * Subscribe to an event once
   */
  once(eventType: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    this.emitter.once(eventType, async (event: DomainEvent) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
      }
    });
  }

  /**
   * Emit an event
   */
  emit(eventType: string, data: Record<string, any>): void {
    const event: DomainEvent = {
      type: eventType,
      timestamp: new Date(),
      data,
    };
    this.emitter.emit(eventType, event);
  }

  /**
   * Remove a specific listener
   */
  off(eventType: string, handler: Function): void {
    this.emitter.off(eventType, handler as any);
  }

  /**
   * Clear all listeners for an event type
   */
  removeAllListeners(eventType?: string): void {
    this.emitter.removeAllListeners(eventType);
  }
}

export const eventBus = EventBus.getInstance();
