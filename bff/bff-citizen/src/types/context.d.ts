/**
 * Request Context Type Definitions
 */

export interface User {
  id: string;
  email: string;
  roles: string[];
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
