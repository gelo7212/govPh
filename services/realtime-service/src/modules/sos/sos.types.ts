/**
 * Type definitions for SOS module
 */

export interface SOSInitRequest {
  sosId: string;
  citizenId: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export interface SOSCloseRequest {
  closedBy: string;
}

export interface SOSStatusUpdateRequest {
  status: 'active' | 'assigned' | 'responding' | 'closed';
  updatedBy: string;
}

export interface SOSState {
  sosId: string;
  citizenId: string;
  status: string;
  createdAt: number;
  closedAt?: number;
  closedBy?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  lastLocationUpdate: number;
}
