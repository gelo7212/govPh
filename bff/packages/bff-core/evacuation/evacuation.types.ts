/**
 * Evacuation Center Types
 */

export interface EvacuationCenterLocation {
  lat: number;
  lng: number;
}

export interface EvacuationCenterCapacity {
  maxIndividuals: number;
  maxFamilies?: number;
  currentIndividuals: number;
  currentFamilies?: number;
}

export interface EvacuationCenterFacilities {
  hasElectricity: boolean;
  hasWater: boolean;
  hasToilet: boolean;
  hasMedicalArea?: boolean;
  hasGenerator?: boolean;
  hasInternet?: boolean;
}

export interface EvacuationCenterContactPerson {
  name: string;
  phone: string;
  position?: string;
}

export interface EvacuationCenterData {
  _id?: string;
  cityId: string;
  name: string;
  location: EvacuationCenterLocation;
  address?: string;
  landmark?: string;
  capacity: EvacuationCenterCapacity;
  status: 'OPEN' | 'FULL' | 'CLOSED' | 'STANDBY';
  facilities: EvacuationCenterFacilities;
  contactPerson?: EvacuationCenterContactPerson;
  lastStatusUpdate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvacuationCenterRequest {
  cityId: string;
  name: string;
  location: EvacuationCenterLocation;
  address?: string;
  landmark?: string;
  capacity: EvacuationCenterCapacity;
  status?: 'OPEN' | 'FULL' | 'CLOSED' | 'STANDBY';
  facilities: EvacuationCenterFacilities;
  contactPerson?: EvacuationCenterContactPerson;
  notes?: string;
}

export interface UpdateEvacuationCenterRequest
  extends Partial<CreateEvacuationCenterRequest> {
  isActive?: boolean;
}

export interface EvacuationCenterResponse<T = EvacuationCenterData> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
}

export interface UpdateCapacityRequest {
  capacity: EvacuationCenterCapacity;
}

export interface UpdateStatusRequest {
  status: 'OPEN' | 'FULL' | 'CLOSED' | 'STANDBY';
}
