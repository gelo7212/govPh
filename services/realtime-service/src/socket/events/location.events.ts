import { Socket, Server } from 'socket.io';
import { logger } from '../../utils/logger';
import { SOCKET_EVENTS } from '../../utils/constants';
import SocketThrottle from '../throttle';
import LocationSampler from '../location.sampler';
import SOSMSClient from '../../services/sos-ms.client';
import SOSService from '../../modules/sos/sos.service';
import axios from 'axios';

const locationThrottle = new SocketThrottle(1000); // 1 second throttle
const locationSampler = new LocationSampler();
const sosMsClient = new SOSMSClient();

const sosService = new SOSService();
// SOS service endpoint (Docker service name or env override)
const SOS_SERVICE_URL = process.env.SOS_SERVICE_URL || 'http://govph-sos:3000';

/**
 * Handle location update events
 */
export const registerLocationEvents = (io: Server, socket: Socket): void => {
  
  socket.on(SOCKET_EVENTS.LOCATION_UPDATE, async (data: any) => {
    try {
      const userId = (socket as any).userId;
      const tokenSosId = (socket as any).sosId; // From auth token (fallback)
      const clientSosId = data.sosId; // From client (explicit)
      const cityCode = (socket as any).cityCode;
      const userRole = (socket as any).role;

      // Use client-provided sosId if available, fall back to token-based
      const sosId = clientSosId;

      // If client provided a different sosId, validate authorization
      if (clientSosId && clientSosId !== tokenSosId) {
        const isAuthorized = await sosMsClient.verifySOS(clientSosId);
        if (!isAuthorized) {
          logger.warn('Unauthorized SOS access attempt', { userId, tokenSosId, clientSosId });
          socket.emit(SOCKET_EVENTS.ERROR, {
            code: 'UNAUTHORIZED_SOS',
            message: 'Not authorized to update this SOS',
          });
          return;
        }
      }

      // Throttle location updates
      if (locationThrottle.shouldThrottle(socket.id)) {
        logger.debug('Location update throttled', { userId, sosId });
        return;
      }

      logger.debug('Location update received', {
        userId,
        sosId,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      // Validate location data
      if (!data.latitude || !data.longitude) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_LOCATION',
          message: 'Invalid location data',
        });
        return;
      }

      const timestamp = Date.now();

      // 1. Broadcast to all in SOS room (realtime)
      const roomName = `sos:${sosId}`;
      io.to(roomName).emit(SOCKET_EVENTS.LOCATION_BROADCAST, {
        userId,
        sosId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp,
        deviceId : data.deviceId,
      });

      // Update Redis geo index and SOS state via service
      const locationData = {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        deviceId: data.deviceId,
      };

      await sosService.updateSOSLocation(sosId, locationData, data.address);

      // Check if location should be persisted (sampler)
      const samplerLocationData = {
        sosId,
        userId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp,
        deviceId: data.deviceId,
      };

      if (locationSampler.shouldSave(samplerLocationData)) {
        // Call SOS service to save location snapshot (fire and forget, don't block socket)
        persistLocationSnapshot(sosId, samplerLocationData, cityCode, userRole, userId, data.address).catch((err) => {
          logger.error('Location snapshot persistence failed', { sosId, error: err });
        });
        locationSampler.recordSave(samplerLocationData);
      } 
    } catch (error) {
      logger.error('Error handling location update', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'LOCATION_UPDATE_ERROR',
        message: 'Failed to process location update',
      });
    }
  });

  socket.on(SOCKET_EVENTS.SOS_CLOSE, () => {
    const sosId = (socket as any).sosId;
    // Clean up sampler state when SOS is closed
    locationSampler.cleanup(sosId);
  });

  /**
   * Handle rescuer location updates
   */
  socket.on(SOCKET_EVENTS.RESCUER_LOCATION, async (data: any) => {
    try {
      const rescuerId = (socket as any).userId;
      const sosId = data.sosId;
      const role = (socket as any).role;
      const isArrived = data.rescuerArrived || false;
      if( role?.toLowerCase() !== 'rescuer') {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'UNAUTHORIZED',
          message: 'Only rescuers can send rescuer location updates',
        });
        return;
      }

      if (!rescuerId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_RESCUER_DATA',
          message: 'Missing rescuerId',
        });
        return;
      }

      // Validate location data
      if (!data.latitude || !data.longitude) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_LOCATION',
          message: 'Invalid location data',
        });
        return;
      }

      logger.debug('Rescuer location update received', {
        rescuerId,
        sosId,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      const timestamp = Date.now();

      // 1. Broadcast to SOS room (all participants in this SOS)
      const roomName = `sos:${sosId}`;
      io.to(roomName).emit(SOCKET_EVENTS.RESCUER_LOCATION_BROADCAST, {
        rescuerId,
        sosId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp,
        rescuerArrived:isArrived,
      });


      logger.debug('Rescuer location updated in realtime', { rescuerId, sosId });
    } catch (error) {
      logger.error('Error handling rescuer location update', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        code: 'RESCUER_LOCATION_ERROR',
        message: 'Failed to process rescuer location update',
      });
    }
  });
};

/**
 * Persist location snapshot to SOS service database
 * This runs asynchronously, failures are logged but don't affect realtime broadcast
 */
async function persistLocationSnapshot(sosId: string, location: any, cityCode: string, userRole: string, userId: string, address:{
  city: string;
  barangay: string;
}): Promise<void> {
  try {
    const url = `${SOS_SERVICE_URL}/api/sos/${sosId}/location-snapshot`;

    await axios.post(
      url,
      {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: address,
        deviceId : location.deviceId
      },
      {
        headers: {
          'X-Internal-Request': 'true', // Internal service auth
          'x-city-id': cityCode || '', // Include city ID if available
          'x-user-role': userRole || '',
          'x-user-id': userId || '',
          'x-device-id': location.deviceId || ''
        },
        timeout: 5000, // Don't wait forever
      },
    );

    logger.debug('Location snapshot persisted to SOS service', { sosId });
  } catch (error) {
    // Log error but don't fail realtime broadcast
    logger.error('Failed to persist location snapshot to SOS service', {
      sosId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // In production, might want to add to retry queue here
  }
}

export default registerLocationEvents;
