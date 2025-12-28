/**
 * Location data structure
 */
interface LocationData {
  sosId: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

/**
 * Haversine formula to calculate distance between two coordinates (in meters)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Location Sampler - Decides which location updates are worth persisting
 * Uses distance threshold and time threshold
 */
export class LocationSampler {
  private lastSavedLocation: Map<string, LocationData> = new Map();
  private lastSaveTime: Map<string, number> = new Map();

  // Configuration
  private readonly DISTANCE_THRESHOLD = 50; // meters - save if moved > 50m
  private readonly TIME_THRESHOLD = 15000; // 15 seconds - save at minimum every 15s

  /**
   * Check if location update should be persisted to database
   * Returns true if distance OR time threshold is exceeded
   */
  shouldSave(location: LocationData): boolean {
    const sosId = location.sosId;
    const now = Date.now();

    // Check time threshold
    const lastSaveTime = this.lastSaveTime.get(sosId) || 0;
    if (now - lastSaveTime > this.TIME_THRESHOLD) {
      return true;
    }

    // Check distance threshold
    const lastLocation = this.lastSavedLocation.get(sosId);
    if (!lastLocation) {
      return true; // First location, always save
    }

    const distance = calculateDistance(
      lastLocation.latitude,
      lastLocation.longitude,
      location.latitude,
      location.longitude,
    );

    if (distance > this.DISTANCE_THRESHOLD) {
      return true;
    }

    return false;
  }

  /**
   * Record that a location was saved
   */
  recordSave(location: LocationData): void {
    this.lastSavedLocation.set(location.sosId, location);
    this.lastSaveTime.set(location.sosId, Date.now());
  }

  /**
   * Clean up entries for closed SOS
   */
  cleanup(sosId: string): void {
    this.lastSavedLocation.delete(sosId);
    this.lastSaveTime.delete(sosId);
  }
}

export default LocationSampler;
