/**
 * Request Context Type Definitions
 */

export interface User {
  userId?: string;
  id: string;
  email: string;
  role: string;
  actor?: Actor;
  identity?: Identity;
  firebaseUid?: string; // Firebase UID from identity.firebaseUid
}

export interface Actor {
  id: string;
  type: string;
  name?: string;
  cityCode?: string;
}

export interface Identity {
  userId: string;
  firebaseUid: string;
  role: string;
  actor?: Actor;
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
