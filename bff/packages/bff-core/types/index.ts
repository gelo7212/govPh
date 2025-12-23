/**
 * Shared Type Definitions
 */

// Identity Types
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
}

// SOS Types
export interface SosLocation {
  latitude: number;
  longitude: number;
}

export interface CreateSosRequest {
  userId: string;
  location: SosLocation;
  description: string;
  type: 'medical' | 'fire' | 'rescue' | 'other';
}

export interface SosRequest {
  id: string;
  userId: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
  location: SosLocation;
  description: string;
  type: string;
  assignedRescuerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Geo Types
export interface Boundary {
  id: string;
  name: string;
  type: string;
  geometry: any; // GeoJSON geometry
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoundarySearchResult {
  id: string;
  name: string;
  type: string;
  distance?: number;
}

// Request Context
export interface RequestContext {
  user?: User;
  requestId: string;
  timestamp: Date;
}

// Error Response
export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}
