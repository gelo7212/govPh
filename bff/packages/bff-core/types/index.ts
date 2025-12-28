/**
 * Shared Type Definitions
 */

/**
 * Citizen Registration Data Structure
 */
export interface CitizenRegistrationData {
  email: string;
  phone: string;
  displayName: string;
  firebaseUid: string;
  address: {
    street: string;
    city: string;
    barangay: string;
    province: string;
    postalCode: string;
    country: string;
  };
  user?: {
    id: string;
  };
}
// Identity Types
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAddress {
  street: string;
  city: string;
  barangay: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface UserProfile {
  id: string;
  firebaseUid: string;
  role: string;
  email: string;
  phone: string;
  displayName: string;
  municipalityCode: string;
  department: string | null;
  registrationStatus: string;
  createdAt: string;
  updatedAt: string;
  address: UserAddress;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
  timestamp: string;
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

export interface SosResponse {
  success: boolean;
  data: {
    id: string;
    userId: string;
    status: string;
    description: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
  timestamp: string;
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

export interface Municipality {
  _id: string;
  code: string;
  name: string;
  type: string;
  district: string;
  zip_code: string;
  region: string;
  province: string;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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
