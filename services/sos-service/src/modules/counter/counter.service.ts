import { CounterRepository } from './counter.repository';

export class CounterService {
  private counterRepository: CounterRepository;

  constructor() {
    this.counterRepository = new CounterRepository();
  }

  /**
   * Generate a unique SOS number in the format: SOS-YYYY-MM-XXXXXX
   * where XXXXXX is a 6-digit sequence number (000001-999999)
   * If sequence exceeds 999999, it resets to 000001
   */
 async generateSOSNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1–12

  const counter = await this.counterRepository.getNextSequence(
    'SOS',
    year,
    month
  );

  const seq = counter.seq;

  // Minimum width = 6, grow naturally after that
  const seqStr =
    seq < 1_000_000
      ? String(seq).padStart(6, '0')
      : String(seq);

  return `SOS-${year}-${String(month).padStart(2, '0')}-${seqStr}`;
}


  /**
   * Get current SOS number sequence for a specific month
   */
  async getCurrentSOSSequence(year?: number, month?: number): Promise<number | null> {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const counter = await this.counterRepository.getCurrentSequence(
      'SOS',
      targetYear,
      targetMonth
    );

    return counter?.seq || null;
  }

  /**
   * Reset SOS counter for a specific month (admin use)
   */
  async resetSOSCounter(year?: number, month?: number): Promise<string> {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    await this.counterRepository.resetSequence('SOS', targetYear, targetMonth);
    return `SOS counter reset for ${targetYear}-${String(targetMonth).padStart(2, '0')}`;
  }

  /**
   * Get all SOS counters
   */
  async getAllSOSCounters() {
    return this.counterRepository.getCountersByType('SOS');
  }

  /**
   * Generate a counter number for a custom type
   * Sequence format: 6-digit (000001-999999), resets to 000001 if exceeded
   */
  async generateCustomNumber(type: string, year?: number, month?: number): Promise<string> {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    if (!type || type.trim().length === 0) {
      throw new Error('Counter type is required');
    }

    let counter = await this.counterRepository.getNextSequence(
      type,
      targetYear,
      targetMonth
    );

    // If sequence exceeds 6 digits (999999), reset to 1
    if (counter.seq > 999999) {
      await this.counterRepository.resetSequence(type, targetYear, targetMonth);
      counter = await this.counterRepository.getNextSequence(
        type,
        targetYear,
        targetMonth
      );
    }

    return `${type}-${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(counter.seq).padStart(6, '0')}`;
  }
}
