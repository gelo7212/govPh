/**
 * Identity Module Type Definitions
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  roles: string[];
  createdAt: Date;
}
