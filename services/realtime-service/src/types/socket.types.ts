/**
 * Socket.IO and realtime-specific types
 */

export interface SocketIOOptions {
  cors: {
    origin: string[];
    methods: string[];
    credentials: boolean;
  };
  transports: string[];
  pingInterval: number;
  pingTimeout: number;
  maxHttpBufferSize: number;
  allowUpgrades: boolean;
  perMessageDeflate: {
    threshold: number;
  };
}

export interface SocketUser {
  userId: string;
  sosId: string;
  role: 'citizen' | 'rescuer' | 'dispatcher';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface SOSMessage {
  senderId: string;
  message: string;
  timestamp: number;
  type: 'text' | 'system';
}

export interface SOSStatus {
  sosId: string;
  status: 'active' | 'assigned' | 'responding' | 'closed';
  lastUpdated: number;
}

export interface SocketSession {
  socketId: string;
  userId: string;
  sosId: string;
  role: string;
  connectedAt: number;
  lastActivityAt: number;
}
