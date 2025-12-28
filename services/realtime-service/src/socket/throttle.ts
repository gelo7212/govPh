/**
 * Throttle socket event emissions to prevent spam
 */
export class SocketThrottle {
  private lastEmitTime: Map<string, number> = new Map();
  private throttleMs: number;

  constructor(throttleMs: number = 500) {
    this.throttleMs = throttleMs;
  }

  /**
   * Check if socket event should be throttled
   */
  shouldThrottle(socketId: string): boolean {
    const lastTime = this.lastEmitTime.get(socketId);
    const now = Date.now();

    if (!lastTime || now - lastTime >= this.throttleMs) {
      this.lastEmitTime.set(socketId, now);
      return false;
    }

    return true;
  }

  /**
   * Reset throttle for a socket
   */
  reset(socketId: string): void {
    this.lastEmitTime.delete(socketId);
  }

  /**
   * Clear all throttle timings
   */
  clear(): void {
    this.lastEmitTime.clear();
  }
}

export default SocketThrottle;
