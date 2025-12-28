import { Counter } from './counter.model';
import { CounterDocument } from './counter.mongo.schema';

export class CounterRepository {
  /**
   * Find or create a counter by type, year, and month
   * Increments the sequence number
   */
  async getNextSequence(
    type: string,
    year: number,
    month: number
  ): Promise<CounterDocument> {
    const counter = await Counter.findOneAndUpdate(
      { type, year, month },
      {
        $inc: { seq: 1 },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: true,
        new: true
      }
    );

    if (!counter) {
      throw new Error('Failed to get next sequence');
    }

    return counter;
  }

  /**
   * Get current sequence without incrementing
   */
  async getCurrentSequence(
    type: string,
    year: number,
    month: number
  ): Promise<CounterDocument | null> {
    return Counter.findOne({ type, year, month });
  }

  /**
   * Reset sequence for a specific type, year, and month
   */
  async resetSequence(
    type: string,
    year: number,
    month: number
  ): Promise<CounterDocument | null> {
    return Counter.findOneAndUpdate(
      { type, year, month },
      { $set: { seq: 0 } },
      { new: true }
    );
  }

  /**
   * Get all counters for a specific type
   */
  async getCountersByType(type: string): Promise<CounterDocument[]> {
    return Counter.find({ type }).sort({ year: -1, month: -1 });
  }

  /**
   * Delete a counter
   */
  async deleteCounter(
    type: string,
    year: number,
    month: number
  ): Promise<boolean> {
    const result = await Counter.deleteOne({ type, year, month });
    return result.deletedCount > 0;
  }

  /**
   * Check if counter exists
   */
  async exists(
    type: string,
    year: number,
    month: number
  ): Promise<boolean> {
    const count = await Counter.countDocuments({ type, year, month });
    return count > 0;
  }
}
