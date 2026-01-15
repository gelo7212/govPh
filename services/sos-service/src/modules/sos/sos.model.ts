import { Types } from "mongoose";
import { CitizenInfo } from "../../services/identity.client";

export type SOSStatus = 'ACTIVE' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED' | 'CANCELLED' | 'REJECTED' | 'FAKE';

export interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface SOS {
  id: string;
  cityId?: string;
  citizenId: string;
  status: SOSStatus;
  lastKnownLocation: GeoJsonPoint;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  message: string;
  soNo: string;
  citizenInfo?: CitizenInfo
  participants?: SosParticipant[];
  assignedResponders: {
    assignedRescuer?: CitizenInfo
    userId: string;
    sosHQId: string;
    sosHQName?: string;
    assignedAt: Date;
    status: 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'REJECTED' | 'LEFT';
  }[];
}

export interface SosParticipant {
  id: string;
  sosId: string;
  userType: 'admin' | 'rescuer';
  userId: Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date | null;
  actorType?: string;
}
