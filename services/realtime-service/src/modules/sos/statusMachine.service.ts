import { logger } from '../../utils/logger';

/**
 * Manages SOS status state machine transitions
 */
export class StatusMachineService {
  private validTransitions = {
    active: ['assigned', 'closed'],
    assigned: ['responding', 'closed'],
    responding: ['closed'],
    closed: [],
  };

  /**
   * Validate and transition SOS status
   */
  async transition(sosId: string, newStatus: string, updatedBy: string): Promise<string> {
    try {
      logger.info('Transitioning SOS status', {
        sosId,
        newStatus,
        updatedBy,
      });

      // Validate transition
      const isValidTransition = this.isValidTransition('active', newStatus);

      if (!isValidTransition) {
        throw new Error(`Invalid status transition to ${newStatus}`);
      }

      return newStatus;
    } catch (error) {
      logger.error('Error transitioning status', error);
      throw error;
    }
  }

  /**
   * Check if transition is valid
   */
  private isValidTransition(currentStatus: string, nextStatus: string): boolean {
    const allowed = this.validTransitions[currentStatus as keyof typeof this.validTransitions];
    return allowed ? (allowed as string[]).includes(nextStatus) : false;
  }
}

export default StatusMachineService;
