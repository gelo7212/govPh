/**
 * SOS Module Type Definitions
 */

export interface CreateSosRequest {
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  type: 'medical' | 'fire' | 'rescue' | 'other';
}

export interface SosResponse {
  id: string;
  userId: string;
  status: 'pending' | 'assigned' | 'resolved' | 'cancelled';
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
