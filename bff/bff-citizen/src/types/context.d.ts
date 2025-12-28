/**
 * Request Context Type Definitions
 */

export interface User {
  id: string; // userId from identity.userId
  email?: string;
  role?: string; // Single role from identity.role
  firebaseUid?: string; // Firebase UID from identity.firebaseUid
  actor?: {
    type: string; // USER, ANON, etc.
    cityCode: string;
  };
}


/**
 * Citizen Registration Data Structure
 */
interface CitizenRegistrationData {
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
}

export interface RequestContext {
  user?: User;
  requestId: string;
  timestamp: Date;
}

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}
