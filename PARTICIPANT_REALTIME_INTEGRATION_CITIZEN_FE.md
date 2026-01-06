# Participant Real-Time Integration Guide - Citizen Frontend

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Target:** Citizen Frontend Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Two-Step Integration](#two-step-integration)
4. [WebSocket Events](#websocket-events)
5. [Implementation Guide](#implementation-guide)
6. [React Hooks](#react-hooks)
7. [State Management](#state-management)
8. [Error Handling](#error-handling)
9. [Complete Example](#complete-example)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The participant system consists of **two separate mechanisms**:

1. **HTTP API** - For database persistence (BFF Citizen endpoints)
2. **WebSocket Events** - For real-time broadcasting (Realtime Service)

**Both must be used together** for complete functionality:
- HTTP creates/deletes participant records
- WebSocket broadcasts changes to all connected clients

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Citizen Frontend                          │
├─────────────────────────────────────────────────────────────┤
│  1. HTTP Call: POST /join                                   │
│     ↓                                                         │
│  2. Socket Emit: sos:room:join                              │
│     ↓                                                         │
│  3. Listen: participant:joined, participant:left            │
└─────────────────────────────────────────────────────────────┘
         ↓                                    ↓
    ┌─────────────┐                  ┌──────────────────┐
    │ BFF Citizen │                  │ Realtime Service │
    │ (HTTP API)  │                  │ (WebSocket)      │
    └─────────────┘                  └──────────────────┘
         ↓                                    ↓
    ┌─────────────┐                  ┌──────────────────┐
    │ SOS Service │────HTTP call──→│ Socket.IO        │
    │ (Database)  │ broadcastJoin   │ room: sos:XXX    │
    └─────────────┘                  └──────────────────┘
```

---

## Two-Step Integration

### Step 1: HTTP Request - Join as Participant

Call the BFF Citizen participant join endpoint to create a database record:

```typescript
const joinAsParticipant = async (
  sosId: string,
  jwtToken: string,
  userType: 'citizen' | 'rescuer' = 'citizen'
) => {
  try {
    const response = await fetch(
      `http://bff-citizen:3000/api/sos/${sosId}/participants/join`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('✓ Joined as participant:', data.data);
      return data.data; // Returns participant object with id, status, etc.
    } else {
      console.error('✗ Join failed:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('✗ HTTP error:', error);
    throw error;
  }
};

// Usage
const participant = await joinAsParticipant(sosId, jwtToken);
```

---

### Step 2: WebSocket Connection - Join Room for Real-Time Updates

After HTTP join succeeds, connect to WebSocket and join the SOS room:

```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const connectToRealtimeService = (jwtToken: string): Socket => {
  socket = io('http://localhost:3002', {
    auth: {
      token: jwtToken,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✓ Connected to realtime service');
  });

  socket.on('connect_error', (error) => {
    console.error('✗ Connection error:', error);
  });

  return socket;
};

// Usage
const socket = connectToRealtimeService(jwtToken);

// Join SOS room
socket.emit('sos:room:join', {
  sosId: sosId,
  userType: 'citizen',
  displayName: 'John Citizen', // Replace with actual name
});
```

---

## WebSocket Events

### Listening for Real-Time Changes

#### Event 1: Participant Joined

```typescript
socket.on('participant:joined', (data) => {
  console.log('🟢 Someone joined:', data);
  // {
  //   sosId: "507f1f77bcf86cd799439011",
  //   userId: "507f1f77bcf86cd799439012",
  //   userType: "citizen",
  //   displayName: "Jane Rescuer",
  //   joinedAt: "2026-01-07T10:30:00Z",
  //   timestamp: 1673085000000
  // }

  // TODO: Update UI - Add to participants list
});
```

**Event Data Structure:**
| Field | Type | Description |
|-------|------|-------------|
| sosId | string | SOS ID |
| userId | string | User who joined |
| userType | string | 'citizen' or 'rescuer' |
| displayName | string | User's display name |
| joinedAt | ISO8601 | When they joined |
| timestamp | number | Unix milliseconds |

---

#### Event 2: Participant Left

```typescript
socket.on('participant:left', (data) => {
  console.log('🔴 Someone left:', data);
  // {
  //   sosId: "507f1f77bcf86cd799439011",
  //   userId: "507f1f77bcf86cd799439012",
  //   leftAt: "2026-01-07T10:35:00Z",
  //   timestamp: 1673085300000
  // }

  // TODO: Update UI - Remove from participants list
});
```

**Event Data Structure:**
| Field | Type | Description |
|-------|------|-------------|
| sosId | string | SOS ID |
| userId | string | User who left |
| leftAt | ISO8601 | When they left |
| timestamp | number | Unix milliseconds |

---

#### Event 3: Active Participants Response

```typescript
// First emit request
socket.emit('participants:active:request', {
  sosId: sosId
});

// Then listen for response
socket.on('participants:active:response', (data) => {
  console.log('📋 Current active participants:', data);
  // {
  //   sosId: "507f1f77bcf86cd799439011",
  //   participants: [
  //     {
  //       userId: "507f1f77bcf86cd799439012",
  //       displayName: "Jane Rescuer",
  //       userType: "citizen",
  //       socketId: "abc123xyz",
  //       connectedAt: 1673085000000
  //     },
  //     ...
  //   ],
  //   count: 3,
  //   timestamp: 1673085000000
  // }

  // TODO: Update UI with full list
});
```

**Response Data Structure:**
| Field | Type | Description |
|-------|------|-------------|
| sosId | string | SOS ID |
| participants | array | Array of participant objects |
| count | number | Total count |
| timestamp | number | Unix milliseconds |

---

#### Event 4: Socket Room Joined (Others Notified)

```typescript
socket.on('sos:room:joined', (data) => {
  console.log('👤 User joined room (notification to others):', data);
  // {
  //   userId: "507f1f77bcf86cd799439012",
  //   sosId: "507f1f77bcf86cd799439011",
  //   userType: "citizen",
  //   displayName: "John Citizen",
  //   socketId: "abc123xyz",
  //   timestamp: 1673085000000
  // }
});
```

---

#### Event 5: Socket Room Left (Others Notified)

```typescript
socket.on('sos:room:left', (data) => {
  console.log('👤 User left room (notification to others):', data);
  // {
  //   userId: "507f1f77bcf86cd799439012",
  //   sosId: "507f1f77bcf86cd799439011",
  //   socketId: "abc123xyz",
  //   timestamp: 1673085300000
  // }
});
```

---

#### Event 6: Errors

```typescript
socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
  // {
  //   code: 'INVALID_SOS_ID' | 'ROOM_JOIN_ERROR' | etc.,
  //   message: 'Error description'
  // }
});
```

---

## Implementation Guide

### Step-by-Step Implementation

#### 1. Setup Socket Connection

```typescript
// services/socket.service.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(token: string): void {
    if (this.isConnected) {
      console.warn('Already connected');
      return;
    }

    this.socket = io(process.env.REACT_APP_REALTIME_URL || 'http://localhost:3002', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('✓ Connected to realtime service');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('✗ Disconnected from realtime service');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  joinSOSRoom(sosId: string, userType: string, displayName: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('sos:room:join', {
      sosId,
      userType,
      displayName,
    });
  }

  leaveSOSRoom(sosId: string): void {
    if (!this.socket) return;

    this.socket.emit('sos:room:leave', { sosId });
  }

  requestActiveParticipants(sosId: string): void {
    if (!this.socket) return;

    this.socket.emit('participants:active:request', { sosId });
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on(event, handler);
  }

  off(event: string, handler?: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.off(event, handler);
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
```

---

#### 2. Create API Service for HTTP Calls

```typescript
// services/participant.service.ts
class ParticipantService {
  private baseUrl = process.env.REACT_APP_BFF_CITIZEN_URL || 'http://bff-citizen:3000/api';

  async joinSOS(
    sosId: string,
    token: string,
    userType: 'citizen' | 'rescuer' = 'citizen'
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/sos/${sosId}/participants/join`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to join SOS: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to join SOS');
    }

    return data.data;
  }

  async leaveSOS(
    sosId: string,
    userId: string,
    token: string
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/sos/${sosId}/participants/${userId}/leave`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to leave SOS: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to leave SOS');
    }
  }

  async getActiveParticipants(
    sosId: string,
    token: string
  ): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/sos/${sosId}/participants/active`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch participants: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch participants');
    }

    return data.data;
  }

  async checkParticipation(
    sosId: string,
    userId: string,
    token: string
  ): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/sos/${sosId}/participants/${userId}/check`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success && data.data.isActive;
  }
}

export const participantService = new ParticipantService();
```

---

## React Hooks

### useParticipantManager Hook

```typescript
// hooks/useParticipantManager.ts
import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socket.service';
import { participantService } from '../services/participant.service';

interface Participant {
  userId: string;
  userType: 'citizen' | 'rescuer';
  displayName: string;
  joinedAt?: string;
  socketId?: string;
}

export const useParticipantManager = (
  sosId: string,
  jwtToken: string,
  currentUserId: string
) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket and check participation
  useEffect(() => {
    // Connect to socket
    socketService.connect(jwtToken);
    setIsConnected(true);

    // Setup event listeners
    const handleParticipantJoined = (data: any) => {
      setParticipants((prev) => [
        ...prev.filter((p) => p.userId !== data.userId), // Remove duplicate if exists
        {
          userId: data.userId,
          userType: data.userType,
          displayName: data.displayName,
          joinedAt: data.joinedAt,
        },
      ]);
    };

    const handleParticipantLeft = (data: any) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
    };

    const handleActiveParticipants = (data: any) => {
      setParticipants(
        data.participants.map((p: any) => ({
          userId: p.userId,
          userType: p.userType,
          displayName: p.displayName,
          socketId: p.socketId,
          joinedAt: new Date(p.connectedAt).toISOString(),
        }))
      );
    };

    socketService.on('participant:joined', handleParticipantJoined);
    socketService.on('participant:left', handleParticipantLeft);
    socketService.on('participants:active:response', handleActiveParticipants);

    // Check if current user is already participating
    const checkAndJoin = async () => {
      try {
        const isParticipating = await participantService.checkParticipation(
          sosId,
          currentUserId,
          jwtToken
        );

        if (isParticipating) {
          setIsJoined(true);
          // Join socket room
          socketService.joinSOSRoom(sosId, 'citizen', 'Current User');
          // Get active participants
          socketService.requestActiveParticipants(sosId);
        }
      } catch (err) {
        console.error('Error checking participation:', err);
      }
    };

    checkAndJoin();

    // Cleanup
    return () => {
      socketService.off('participant:joined', handleParticipantJoined);
      socketService.off('participant:left', handleParticipantLeft);
      socketService.off('participants:active:response', handleActiveParticipants);
    };
  }, [sosId, jwtToken, currentUserId]);

  // Join SOS
  const join = useCallback(async (userType: 'citizen' | 'rescuer' = 'citizen') => {
    try {
      setIsLoading(true);
      setError(null);

      // HTTP call to create participant record
      await participantService.joinSOS(sosId, jwtToken, userType);

      // Socket call to join room
      socketService.joinSOSRoom(sosId, userType, 'Current User');

      // Get active participants
      socketService.requestActiveParticipants(sosId);

      setIsJoined(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join SOS';
      setError(message);
      console.error('Error joining SOS:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sosId, jwtToken]);

  // Leave SOS
  const leave = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // HTTP call to remove participant
      await participantService.leaveSOS(sosId, currentUserId, jwtToken);

      // Socket call to leave room
      socketService.leaveSOSRoom(sosId);

      setIsJoined(false);
      setParticipants([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave SOS';
      setError(message);
      console.error('Error leaving SOS:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sosId, currentUserId, jwtToken]);

  // Refresh participants list
  const refreshParticipants = useCallback(() => {
    socketService.requestActiveParticipants(sosId);
  }, [sosId]);

  return {
    participants,
    isJoined,
    isLoading,
    error,
    isConnected,
    join,
    leave,
    refreshParticipants,
  };
};
```

---

## State Management

### Redux Integration (Optional)

```typescript
// store/participantSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Participant {
  userId: string;
  userType: 'citizen' | 'rescuer';
  displayName: string;
  joinedAt?: string;
}

interface ParticipantState {
  participants: Participant[];
  isJoined: boolean;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

const initialState: ParticipantState = {
  participants: [],
  isJoined: false,
  isLoading: false,
  error: null,
  isConnected: false,
};

const participantSlice = createSlice({
  name: 'participant',
  initialState,
  reducers: {
    addParticipant: (state, action: PayloadAction<Participant>) => {
      const exists = state.participants.find((p) => p.userId === action.payload.userId);
      if (!exists) {
        state.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action: PayloadAction<string>) => {
      state.participants = state.participants.filter(
        (p) => p.userId !== action.payload
      );
    },
    setParticipants: (state, action: PayloadAction<Participant[]>) => {
      state.participants = action.payload;
    },
    setIsJoined: (state, action: PayloadAction<boolean>) => {
      state.isJoined = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
});

export const {
  addParticipant,
  removeParticipant,
  setParticipants,
  setIsJoined,
  setIsLoading,
  setError,
  setIsConnected,
} = participantSlice.actions;

export default participantSlice.reducer;
```

---

## Error Handling

### Common Errors and Solutions

```typescript
const handleJoinError = (error: any) => {
  if (error.message.includes('401')) {
    // Token expired or invalid
    return 'Please login again';
  }

  if (error.message.includes('404')) {
    // SOS not found
    return 'SOS incident not found';
  }

  if (error.message.includes('400')) {
    // Bad request
    return 'Invalid request data';
  }

  return 'Failed to join SOS. Please try again.';
};

const handleConnectionError = (error: any) => {
  if (error.message.includes('ECONNREFUSED')) {
    return 'Cannot connect to realtime service. Check your connection.';
  }

  if (error.message.includes('ETIMEDOUT')) {
    return 'Connection timeout. Please try again.';
  }

  return 'Connection error. Please refresh and try again.';
};
```

---

## Complete Example

### Full Component Implementation

```typescript
// components/SOSParticipantsPanel.tsx
import React, { useState } from 'react';
import { useParticipantManager } from '../hooks/useParticipantManager';

interface SOSParticipantsPanelProps {
  sosId: string;
  jwtToken: string;
  currentUserId: string;
  currentUserName: string;
}

export const SOSParticipantsPanel: React.FC<SOSParticipantsPanelProps> = ({
  sosId,
  jwtToken,
  currentUserId,
  currentUserName,
}) => {
  const {
    participants,
    isJoined,
    isLoading,
    error,
    isConnected,
    join,
    leave,
    refreshParticipants,
  } = useParticipantManager(sosId, jwtToken, currentUserId);

  const handleJoinClick = async () => {
    try {
      await join('citizen');
    } catch (error) {
      console.error('Join failed:', error);
    }
  };

  const handleLeaveClick = async () => {
    try {
      await leave();
    } catch (error) {
      console.error('Leave failed:', error);
    }
  };

  return (
    <div className="participants-panel">
      <div className="panel-header">
        <h3>Active Participants</h3>
        <div className="status-indicator">
          {isConnected ? (
            <span className="status-live">🔴 Live</span>
          ) : (
            <span className="status-offline">⚪ Offline</span>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="join-section">
        {!isJoined ? (
          <button
            onClick={handleJoinClick}
            disabled={isLoading || !isConnected}
            className="btn btn-primary"
          >
            {isLoading ? 'Joining...' : 'Join as Responder'}
          </button>
        ) : (
          <button
            onClick={handleLeaveClick}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            {isLoading ? 'Leaving...' : 'Leave SOS'}
          </button>
        )}
      </div>

      <div className="participants-list">
        <h4>
          {participants.length} Participant{participants.length !== 1 ? 's' : ''}
        </h4>

        {participants.length === 0 ? (
          <p className="empty-state">No participants yet</p>
        ) : (
          <ul>
            {participants.map((p) => (
              <li key={p.userId} className="participant-item">
                <div className="participant-info">
                  <div className="participant-name">
                    {p.displayName || p.userId}
                    {p.userId === currentUserId && <span className="badge-self">(You)</span>}
                  </div>
                  <div className="participant-type">
                    <span className={`type-badge ${p.userType}`}>{p.userType}</span>
                  </div>
                </div>
                <div className="participant-timestamp">
                  {p.joinedAt && (
                    <small>{new Date(p.joinedAt).toLocaleTimeString()}</small>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={refreshParticipants}
        disabled={isLoading}
        className="btn btn-sm btn-outline"
      >
        Refresh List
      </button>
    </div>
  );
};
```

### Component Usage

```typescript
// pages/SOSDetailPage.tsx
import { SOSParticipantsPanel } from '../components/SOSParticipantsPanel';

export const SOSDetailPage: React.FC = () => {
  const { sosId } = useParams<{ sosId: string }>();
  const { jwtToken, userId, userName } = useAuth();

  return (
    <div className="sos-detail-page">
      <div className="sos-content">
        <SOSMap sosId={sosId} />
        
        <SOSParticipantsPanel
          sosId={sosId}
          jwtToken={jwtToken}
          currentUserId={userId}
          currentUserName={userName}
        />
      </div>
    </div>
  );
};
```

---

## Troubleshooting

### Problem: Participants not showing up after join

**Check:**
1. HTTP POST /join returned success ✓
2. WebSocket socket:room:join was emitted ✓
3. Listening for 'participant:joined' event ✓

```typescript
// Debug log
socket.on('participant:joined', (data) => {
  console.log('Received participant:joined:', data);
  console.log('My userId:', currentUserId);
  console.log('Participants:', participants);
});
```

---

### Problem: Lost connection to realtime service

**Check:**
1. Realtime service is running: `docker ps | grep realtime-service`
2. JWT token is valid: Check token expiry
3. WebSocket URL is correct: `http://localhost:3002`

```typescript
socket.on('disconnect', (reason) => {
  console.error('Disconnected:', reason);
  // 'io server disconnect' = server shut down
  // 'io client disconnect' = client called disconnect()
  // 'ping timeout' = no response for 60s
});
```

---

### Problem: 401 Unauthorized on HTTP call

**Check:**
1. JWT token is in Authorization header ✓
2. Token hasn't expired: `jwt.decode(token)`
3. BFF Citizen is running: `docker ps | grep bff-citizen`

```typescript
const checkToken = (token: string) => {
  const decoded = JSON.parse(atob(token.split('.')[1]));
  const expiresAt = decoded.exp * 1000;
  const isExpired = Date.now() > expiresAt;
  console.log('Token expired?', isExpired);
};
```

---

### Problem: Multiple participants not updating in real-time

**Check:**
1. All participants joined the same SOS room ✓
2. Socket.IO adapter is working (Redis for scaled deployments)
3. Browser DevTools WebSocket tab shows messages

```typescript
// Enable Socket.IO debug logging
localStorage.debug = 'socket.io-client:socket';
```

---

### Problem: Can't connect after leaving and rejoining

**Solution:**
```typescript
// Properly cleanup before reconnecting
socket.off('participant:joined');
socket.off('participant:left');
socket.disconnect();

// Then reconnect
socketService.connect(newToken);
```

---

## Quick Reference

| Task | Method |
|------|--------|
| Join SOS (DB) | `participantService.joinSOS(sosId, token)` |
| Join WebSocket Room | `socketService.joinSOSRoom(sosId, userType, displayName)` |
| Listen for joins | `socket.on('participant:joined', handler)` |
| Listen for leaves | `socket.on('participant:left', handler)` |
| Get active list | `socketService.requestActiveParticipants(sosId)` |
| Leave SOS (DB) | `participantService.leaveSOS(sosId, userId, token)` |
| Leave WebSocket Room | `socketService.leaveSOSRoom(sosId)` |
| Disconnect | `socketService.disconnect()` |

---

## Environment Variables

Add these to your `.env` file:

```env
REACT_APP_BFF_CITIZEN_URL=http://bff-citizen:3000/api
REACT_APP_REALTIME_URL=http://localhost:3002
REACT_APP_JWT_TOKEN=your_jwt_token
```

---

## Summary

1. **HTTP Join** - Creates database record
2. **Socket Join** - Connects to real-time room
3. **Listen** - Subscribe to participant:joined and participant:left events
4. **Update UI** - Add/remove participants as events arrive
5. **Leave** - HTTP leave removes from database, socket leave removes from room

All events are real-time and broadcast to all connected clients in the SOS room! ✨
