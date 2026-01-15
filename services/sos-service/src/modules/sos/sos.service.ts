import { SOSRepository } from './sos.repository';
import { SOS } from './sos.model';
import { identityClient } from '../../services/identity.client';
import { eventBus, SOS_EVENTS, type SOSCreatedEvent, type SOSStatusChangedEvent, type SOSTaggedEvent } from '../events';
import { SosParticipantService } from '../sos_participants';
import { createLogger } from '../../utils/logger';
const logger = createLogger('SOSService');

export class SOSService {
  constructor(
    private repository: SOSRepository,
    private participantService?: SosParticipantService ,
  ) {}

  async createSOS(data: {
    cityId?: string;
    citizenId?: string;
    sosNo: string;
    longitude: number;
    latitude: number;
    message: string;
    type: string;
    address?: {
      city: string;
      barangay: string;
    };
    deviceId?: string;
  }): Promise<SOS> {
    const sos = await this.repository.create({
      cityId: data.cityId,
      citizenId: data.citizenId,
      sosNo: data.sosNo,
      status: 'ACTIVE',
      lastKnownLocation: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      },
      address: data.address,
      message: data.message,
      type: data.type,
      deviceId : data.deviceId
    });

    // Emit event for other modules to handle (e.g., send initial message)
    let citizenName = 'Anonymous Citizen';
    try {
      if(data.citizenId){
        const userInfo = await identityClient.getCitizenInfo(data.citizenId);
        citizenName = userInfo?.displayName || 'Anonymous Citizen';
      }
    } catch (error) {
      console.error('Error fetching citizen info:', error);
    }

    const sosCreatedEvent: SOSCreatedEvent = {
      sosId: sos.id,
      citizenId: data.citizenId,
      cityId: data.cityId,
      sosNo: data.sosNo,
      longitude: data.longitude,
      latitude: data.latitude,
      message: data.message,
      type: data.type,
      address: data.address,
      name: citizenName,
    };
    eventBus.emit(SOS_EVENTS.CREATED, sosCreatedEvent);

    return sos;
  }

  async updateTag(sosId: string,  tag: string): Promise<SOS> {
    const sos = await this.repository.updateTag(sosId, tag);
    
    const sosTaggedEvent: SOSTaggedEvent = {
      sosId: sos.id,
      tag,
    };
    eventBus.emit(SOS_EVENTS.TAGGED, sosTaggedEvent);
    
    return sos;
  }

  async getSOS(id: string): Promise<SOS | null> {
    const sos = await this.repository.findById(id);
    if (!sos) return null;

    // Collect all user IDs that need to be fetched
    const userIdsToFetch = new Set<string>();
    if (sos.assignedResponders) sos.assignedResponders.forEach(r => userIdsToFetch.add(r.userId));
    if (sos.citizenId) userIdsToFetch.add(sos.citizenId);

    // Fetch participants first, then collect their user IDs
    try {
      let participants = await this.participantService?.getParticipantHistory(sos.id);
      if (participants?.length) {
        
        // userType == rescuer 
        participants = participants.filter(p => p.userType === 'rescuer');
        participants.forEach(p => userIdsToFetch.add(p.userId.toString()));
      }
      sos.participants = participants || [];
    } catch (error) {
      logger.error('Error fetching SOS participants', { sosId: sos.id, error });
      sos.participants = [];
    }

    // Batch fetch all required user info in parallel
    const userInfoMap = new Map<string, any>();
    if (userIdsToFetch.size > 0) {
      const userInfoPromises = Array.from(userIdsToFetch).map(userId =>
        identityClient.getCitizenInfo(userId)
          .then(info => ({ userId, info }))
          .catch(error => {
            console.error(`Error fetching user info for ${userId}:`, error);
            return { userId, info: null };
          })
      );

      const results = await Promise.all(userInfoPromises);
      results.forEach(({ userId, info }) => {
        if (info) userInfoMap.set(userId, info);
      });
    }

    // Attach user info to SOS fields
    if (sos.assignedResponders && sos.assignedResponders.length > 0) {
      sos.assignedResponders = sos.assignedResponders.map(responder => ({
        ...responder,
        assignedRescuer: userInfoMap.get(responder.userId),
      }));
    }
    if (sos.citizenId && userInfoMap.has(sos.citizenId)) {
      sos.citizenInfo = userInfoMap.get(sos.citizenId);
    }

    // Attach user info to participants
    sos.participants = sos.participants.map(participant => ({
      ...participant,
      userInfo: userInfoMap.get(participant.userId.toString()),
    }));

    return sos;
  }

  async listSOS(cityId: string, options?: {
    filters?: {
      date?: { startDate?: string; endDate?: string };
      type?: string[];
      status?: string[];
      soNo?: string;
      citizenId?: string;
    };
    search?: string;
    sort?: {
      field: 'createdAt' | 'type' | 'status';
      order: 'asc' | 'desc';
    };
    }, 
    hqLocation?: {
      longitude: number;
      latitude: number;
      radius: number;
    }): Promise<SOS[]> {
    try {
      const sosList = await this.repository.findAll(cityId, options, hqLocation);
      return sosList;
    } catch (error) {
      console.error('Error listing SOS requests:', error);
      throw error;
    }
  }
  
  async updateSOSStatus(sosId: string,  status: string): Promise<SOS> {
    const sos = await this.repository.updateStatus(sosId, status);
    
    const sosStatusChangedEvent: SOSStatusChangedEvent = {
      sosId: sos.id,
      cityId: sos.cityId,
      previousStatus: sos.status, // Note: You may need to fetch previous status from repo
      newStatus: status,
    };
    eventBus.emit(SOS_EVENTS.STATUS_CHANGED, sosStatusChangedEvent);
    
    return sos;
  }

  async listByStatus(cityId: string, status: string): Promise<SOS[]> {
    const sosList = await this.repository.findByStatus(cityId, status);
    return sosList;
  }

  async getActiveSOSByCitizen(citizenId: string): Promise<SOS | null> {
    const sosList = await this.repository.findByCitizen(citizenId);
    const activeSOS = sosList.find((sos) => sos.status === 'ACTIVE' || sos.status === 'EN_ROUTE' || sos.status === 'ARRIVED');
    return activeSOS || null;
  }

  async listByCitizen(citizenId: string): Promise<SOS[]> {
    const sosList = await this.repository.findByCitizen(citizenId);
    return sosList;
  }

  async updateLocation(sosId: string, cityId: string, location: any): Promise<SOS> {
    return await this.repository.updateWithoutCity(sosId, {
      lastKnownLocation: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
    });
  }

  /**
   * Save location snapshot from realtime service
   * Called by location sampler with meaningful location changes
   */
  async saveLocationSnapshot(sosId: string, location: any, cityId: string): Promise<SOS> {
    // Save location with timestamp for audit trail
    try {
      if(cityId === undefined){
        throw new Error('City ID is required to save location snapshot');
      }
      if(location.address == undefined || location.address === null ){
        return await this.repository.updateWithoutCity( sosId, {
          lastKnownLocation: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude],
          },
          lastLocationUpdate: new Date(),
        });
      }

      return await this.repository.updateWithoutCity(sosId, {
        lastKnownLocation: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
        lastLocationUpdate: new Date(),
        address: location.address,
      });
    } catch (error) {
      console.error('Error saving location snapshot:', error);
      throw new Error('Failed to save location snapshot: ' + error);
    }
  }

  async sendMessage(sosId: string, cityId: string, messageData: any): Promise<any> {
    // This will be implemented with the message service
    // For now, return a mock message
    return {
      id: `msg_${Date.now()}`,
      content: messageData.content,
      createdAt: new Date(),
    };
  }

  async updateSOS(id: string, cityId: string, data: any): Promise<SOS> {
    const sos = await this.repository.updateWithoutCity(id , data);
    return sos;
  }

  async deleteSOS(id: string, cityId: string): Promise<void> {
    await this.repository.delete(id, cityId);
  }

  async createAnonRescuer(sosId: string, requestMissionId: string, cityCode: string): Promise<string | null> {
    console.log(`Creating anon rescuer for SOS ${sosId} with mission ${requestMissionId} in city ${cityCode}`)

    const token = await identityClient.generateRescuerSosToken(sosId, requestMissionId, cityCode);
    if (token) {
        console.log(`Generated Anon Rescuer SOS Token: ${token}`); 
    } else {
        console.error('Failed to generate Anon Rescuer SOS Token');
    }
    return token
  }

  async rescuerLeftSOS(sosId: string, rescuerId: string): Promise<void> {
    await this.repository.rescuerLeftSOS(sosId, rescuerId);
    // check if sos has any assigned responders left
    const sos = await this.repository.findById(sosId);
    if(sos){
      const activeResponders = sos.assignedResponders?.filter(r => r.status !== 'LEFT' && r.status !== 'REJECTED');
      if(!activeResponders || activeResponders.length === 0){
        // if no active responders left, update sos status to ACTIVE
        this.updateSOSStatus(sosId, 'ACTIVE');
      }
    }
  }
}
