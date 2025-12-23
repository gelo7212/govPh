/**
 * Request Context Type Definitions
 */

export interface User {
  id: string;
  email: string;
  roles: string[];
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
