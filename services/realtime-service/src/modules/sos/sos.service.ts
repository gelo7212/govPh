import redisClient from '../../config/redis';
import { logger } from '../../utils/logger';
import { REDIS_KEYS } from '../../utils/constants';
import { SOSMSClient } from '../../services/sos-ms.client';
/**
 * SOS Service - Manages realtime SOS state
 */
export class SOSService {
  
  private sosMSClient: SOSMSClient = new SOSMSClient();


  async initSOS(sosId: string, citizenId: string, location: any, address: any, type: string): Promise<any> {
    try {
      const state = {
        sosId,
        citizenId,
        status: 'active',
        createdAt: Date.now(),
        lastLocationUpdate: Date.now(),
        location: location || null,
        address: address || null,
        type: type || 'Other',
      };

      const key = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
      await redisClient.setEx(key, 86400, JSON.stringify(state)); // 24 hour TTL

      // Add to geospatial index for efficient location-based queries
      if (location?.longitude && location?.latitude) {
        const geoKey = `${REDIS_KEYS.SOS_STATE}:geo`;
        await redisClient.geoAdd(geoKey, {
          longitude: location.longitude,
          latitude: location.latitude,
          member: sosId,
        });
        // Set same TTL for geo index
        await redisClient.expire(geoKey, 86400);
      }

      logger.info('SOS initialized in realtime', { sosId, citizenId });

      return state;
    } catch (error) {
      logger.error('Error initializing SOS', error);
      throw error;
    }
  }

  async updateSosType(sosId: string, type: string): Promise<void> {
    try {
      const key = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
      const data = await redisClient.get(key);
      if (data) {
        const state = JSON.parse(data);
        state.type = type;
        await redisClient.setEx(key, 86400, JSON.stringify(state));
        logger.info('SOS type updated in realtime', { sosId, type });
      }
    } catch (error) {
      logger.error('Error updating SOS type', error);
      throw error;
    }
  }

  /**
   * Close SOS realtime context
   */
  async closeSOS(sosId: string, closedBy: string): Promise<void> {
    try {
      const key = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
      const data = await redisClient.get(key);

      if (data) {
        const state = JSON.parse(data);
        state.status = 'closed';
        state.closedAt = Date.now();
        state.closedBy = closedBy;

        // Keep for 1 hour after closing for history
        await redisClient.setEx(key, 3600, JSON.stringify(state));

        // Remove from geospatial index
        const geoKey = `${REDIS_KEYS.SOS_STATE}:geo`;
        await redisClient.zRem(geoKey, sosId);
      }

      logger.info('SOS closed in realtime', { sosId, closedBy });
    } catch (error) {
      logger.error('Error closing SOS', error);
      throw error;
    }
  }

  async updateStatus(sosId: string, status: string): Promise<void> {
    try {
      console.log(`Updating SOS ${sosId} status to ${status}`);
      const key = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
      const data = await redisClient.get(key);
      if (data) {
        const state = JSON.parse(data);
        console.log("Current SOS state:", state);
        state.status = status;
        state.lastStatusUpdate = Date.now();
        await redisClient.setEx(key, 86400, JSON.stringify(state));
        logger.info('SOS status updated in realtime', { sosId, status , data});
      }
    } catch (error) {
      logger.error('Error updating SOS status', error);
      throw error;
    }
  }

  /**
   * Get current SOS state & Synchronize the redis state with SOS MS if not found
   */
  async getSOSState(sosId: string): Promise<any> {
    try {
      const key = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
      const data = await redisClient.get(key);
      if(!data){
        // Sync from SOS MS
        await this.sosSync(sosId, {});
        const newData = await redisClient.get(key);
        return newData ? JSON.parse(newData) : null;
      }
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Error getting SOS state', error);
      return null;
    }
  }

  /**
   * Update SOS location
   */
  async updateSOSLocation(sosId: string, location: any, address: any): Promise<void> {
    try {
      const state = await this.getSOSState(sosId);
      
      if (state) {
        state.location = location;
        state.address = address;
        state.lastLocationUpdate = Date.now();

        const key = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
        await redisClient.setEx(key, 86400, JSON.stringify(state));

        // Update geospatial index
        if (location?.longitude && location?.latitude) {
          const geoKey = `${REDIS_KEYS.SOS_STATE}:geo`;
          await redisClient.geoAdd(geoKey, {
            longitude: location.longitude,
            latitude: location.latitude,
            member: sosId,
          });
        }
      }
    } catch (error) {
      logger.error('Error updating SOS location', error);
      throw error;
    }
  }

  /**
   * Get SOS realtime state by city coordinates
   * @param cityLat - City center latitude
   * @param cityLon - City center longitude
   * @param radiusKm - Search radius in kilometers (default: 50 km for full city coverage)
   * @returns Array of active SOS requests in city radius
   */
  async getSOSByCityAndNearby(cityLat: number, cityLon: number, radiusKm: number = 50): Promise<any[]> {
    try {
      if (!cityLat || !cityLon || typeof cityLat !== 'number' || typeof cityLon !== 'number') {
        logger.error('Invalid city coordinates provided', { cityLat, cityLon });
        return [];
      }

      // Use geo radius with city coordinates
      return await this.getSOSNearbyLocation(cityLon, cityLat, radiusKm);
    } catch (error) {
      logger.error('Error getting SOS by city', error);
      return [];
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get nearby SOS requests based on longitude and latitude using Redis GEO commands
   * Optimized for scale - works efficiently with millions of records
   * @param longitude - User's longitude coordinate
   * @param latitude - User's latitude coordinate
   * @param radiusKm - Search radius in kilometers (default: 20 km)
   * @returns Array of nearby SOS requests with distance information, sorted by distance
   */
  async getSOSNearbyLocation(longitude: number, latitude: number, radiusKm: number = 20): Promise<any[]> {
    try {
      if (!longitude || !latitude || typeof longitude !== 'number' || typeof latitude !== 'number') {
        logger.error('Invalid coordinates provided', { longitude, latitude });
        return [];
      }

      const geoKey = `${REDIS_KEYS.SOS_STATE}:geo`;
      
      // Use Redis GEOSEARCH for efficient location-based queries (Redis 6.2+)
      // Falls back to manual calculation if GEOSEARCH not available
      let nearbyIds: any[] = [];
      
      try {
        // GEOSEARCH returns members within radius, already sorted by distance
        nearbyIds = await redisClient.geoSearch(
          geoKey,
          { longitude, latitude },
          { radius: radiusKm, unit: 'km' }
        ) as any[];
      } catch (geoSearchError) {
        // Fallback: Use GEORADIUS if available
        logger.warn('GEOSEARCH not available, using GEORADIUS fallback', { radiusKm });
        nearbyIds = await redisClient.geoRadius(
          geoKey,
          { longitude, latitude },
          radiusKm,
          'km'
        ) as any;
      }

      if (!nearbyIds || nearbyIds.length === 0) {
        logger.info('No nearby SOS requests found', { longitude, latitude, radiusKm });
        return [];
      }

      // Fetch full state for each nearby SOS
      const nearbySOS = [];
      for (const memberId of nearbyIds) {
        const key = `${REDIS_KEYS.SOS_STATE}:${memberId}`;
        const data = await redisClient.get(key);
        if (data) {
          const state = JSON.parse(data);
          
          // Only include active SOS requests
          if ((state.status === 'active' || state.status === 'arrived' || state.status === 'en_route') && state.location?.longitude && state.location?.latitude) {
            const distance = this.calculateDistance(
              latitude,
              longitude,
              state.location.latitude,
              state.location.longitude
            );
            
            nearbySOS.push({
              ...state,
              distance: Math.round(distance * 100) / 100,
            });
          }
        }
      }

      // Sort by distance
      nearbySOS.sort((a, b) => a.distance - b.distance);

      logger.info('Found nearby SOS requests', { 
        longitude, 
        latitude, 
        radiusKm, 
        count: nearbySOS.length 
      });

      return nearbySOS;
    } catch (error) {
      logger.error('Error getting nearby SOS by location', error);
      return [];
    }
  }

  async upsertRescuerLocation(rescuerId: string, location: any, sosId: string): Promise<{
    rescuerArrived: boolean;
    details?: string;
  }> {
    try {
      const key = `${REDIS_KEYS.RESCUER_LOCATION}:${rescuerId}:${sosId}`;
      await redisClient.setEx(key, 86400, JSON.stringify({
        rescuerId,
        location,
        updatedAt: Date.now(),
        sosId,
        rescuerArrived: false,
      }));

      if(sosId){        
        const sosState = await this.getSOSState(sosId);
        
        console.log("Rescuer location upserted", { rescuerId, location, sosId, status: sosState?.status });
        if(sosState.status?.toLowerCase() !== 'en_route' ){
          // Only check for arrival if SOS is in EN_ROUTE status,
          return { rescuerArrived: false, details: 'SOS not in EN_ROUTE status' };
        }
        
        console.log("Checking arrival condition for SOS", sosId);
        if (sosState && sosState.location?.latitude && sosState.location?.longitude) {
          const distance = this.calculateDistance(
            location.latitude,
            location.longitude,
            sosState.location.latitude,
            sosState.location.longitude
          );
          console.log("Calculated distance to SOS", distance, "km");
          
          // If within 100 meters, auto-transition to "arrived"
          if (distance < 0.1) {
            sosState.status = 'arrived';
            sosState.arrivedAt = Date.now();
            sosState.arrivedBy = rescuerId;
            const sosKey = `${REDIS_KEYS.SOS_STATE}:${sosId}`;
            await redisClient.setEx(sosKey, 86400, JSON.stringify(sosState));
            const headerContext = {
              'x-user-role': 'RESCUER',
              'x-user-id': rescuerId,
              'x-actor-type': 'USER',
              'x-city-id': sosState.cityCode || undefined,
              'x-request-id': `req_${Date.now()}`,
            };
            const data = await redisClient.get(key);
            const locationData = data ? JSON.parse(data) : {};
            locationData.rescuerArrived = true;
            await redisClient.setEx(key, 86400, JSON.stringify(locationData));
            console.log("Location data updated with rescuerArrived true",JSON.stringify(locationData));

            await this.sosMSClient.updateStatus(sosId, 'ARRIVED', headerContext);
            
            logger.info('SOS status auto-transitioned to arrived', { sosId, rescuerId, distance });
            
            return { rescuerArrived: true };
          }
        }
      }

      return { rescuerArrived: false };
    } catch (error) {
      logger.error('Error upserting rescuer location', error);
      throw error;
    }
  }

  async getRescuerLocation(rescuerId: string, sosId: string): Promise<any> {
    try {
      console.log("Getting rescuer location for", rescuerId, sosId);
      const key = `${REDIS_KEYS.RESCUER_LOCATION}:${rescuerId}:${sosId}`;
      const data = await redisClient.get(key);  
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Error getting rescuer location', error);
      return null;
    }
  }

  async sosSync(sosId: string, headerContext: any): Promise<void> {
    try {
      const sosRecord = await this.sosMSClient.getSos(sosId, headerContext);
      if (sosRecord) {
        console.log("Syncing SOS from SOS MS", JSON.stringify(sosRecord));
        const location = sosRecord.location || null;
        const address = sosRecord.address || null;
        await this.initSOS(sosId, sosRecord.citizenId, location, address, sosRecord.type || 'Other');
        logger.info('SOS synced from SOS MS', { sosId });
      }
    } catch (error) {
      logger.error('Error syncing SOS from SOS MS', error);
    }
  }
}

export default SOSService;
