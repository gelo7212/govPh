# Participants API - Realtime Service

## Overview
New internal HTTP API in Realtime Service that allows the SOS Service to trigger participant-related socket events.

## Files Created
- `services/realtime-service/src/modules/participants/participants.controller.ts` - API handlers
- `services/realtime-service/src/modules/participants/participants.routes.ts` - Route definitions
- `services/sos-service/src/services/realtime-service.client.ts` - HTTP client for calling the API

## Files Updated
- `services/realtime-service/src/app.ts` - Registered new routes
- `services/sos-service/src/modules/sos_participants/participant.service.ts` - Integrated with realtime service

---

## API Endpoints

All endpoints require `X-Internal-Request: true` header (internal-only).

### 1. Broadcast Participant Joined
**POST** `/internal/participants/joined`

Called when a participant joins a SOS. Broadcasts to all connected clients in the SOS room.

**Request:**
```json
{
  "sosId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "userType": "rescuer",
  "displayName": "John Rescue",
  "joinedAt": "2026-01-07T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Participant joined event broadcasted",
  "data": {
    "sosId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "userType": "rescuer",
    "roomName": "sos:507f1f77bcf86cd799439011"
  }
}
```

**Socket Event Triggered:**
```javascript
socket.on('participant:joined', {
  sosId: "507f1f77bcf86cd799439011",
  userId: "507f1f77bcf86cd799439012",
  userType: "rescuer",
  displayName: "John Rescue",
  joinedAt: "2026-01-07T10:30:00Z",
  timestamp: 1704621000000
});
```

---

### 2. Broadcast Participant Left
**POST** `/internal/participants/left`

Called when a participant leaves a SOS. Broadcasts to all connected clients and disconnects the participant's sockets.

**Request:**
```json
{
  "sosId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "leftAt": "2026-01-07T10:35:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Participant left event broadcasted",
  "data": {
    "sosId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "roomName": "sos:507f1f77bcf86cd799439011"
  }
}
```

**Socket Event Triggered:**
```javascript
socket.on('participant:left', {
  sosId: "507f1f77bcf86cd799439011",
  userId: "507f1f77bcf86cd799439012",
  leftAt: "2026-01-07T10:35:00Z",
  timestamp: 1704621300000
});
```

---

### 3. Get Active Participants
**GET** `/internal/participants/:sosId/active`

Get list of currently connected participants in a SOS room (socket-level view).

**Parameters:**
- `sosId` (path) - SOS ID

**Response:**
```json
{
  "success": true,
  "data": {
    "sosId": "507f1f77bcf86cd799439011",
    "participants": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "displayName": "John Rescue",
        "userType": "rescuer",
        "socketId": "socket-123",
        "connectedAt": 1704621000000
      },
      {
        "userId": "507f1f77bcf86cd799439013",
        "displayName": "Admin User",
        "userType": "admin",
        "socketId": "socket-456",
        "connectedAt": 1704621010000
      }
    ],
    "count": 2,
    "timestamp": 1704621030000
  }
}
```

---

### 4. Get Participant Count
**GET** `/internal/participants/:sosId/count`

Get number of currently connected participants in a SOS room.

**Parameters:**
- `sosId` (path) - SOS ID

**Response:**
```json
{
  "success": true,
  "data": {
    "sosId": "507f1f77bcf86cd799439011",
    "count": 5,
    "timestamp": 1704621030000
  }
}
```

---

## Integration Flow

### When Participant Joins:
```
1. Frontend: POST /sos/{sosId}/participants/join (SOS Service)
   ↓
2. SOS Service: Save to DB
   ↓
3. SOS Service: POST /internal/participants/joined (Realtime Service)
   ↓
4. Realtime Service: Broadcast 'participant:joined' to SOS room
   ↓
5. Frontend: Receive socket event and update UI
```

### When Participant Leaves:
```
1. Frontend: PATCH /sos/{sosId}/participants/{userId}/leave (SOS Service)
   ↓
2. SOS Service: Mark as left in DB
   ↓
3. SOS Service: POST /internal/participants/left (Realtime Service)
   ↓
4. Realtime Service: Broadcast 'participant:left' to SOS room + disconnect sockets
   ↓
5. Frontend: Receive socket event and update UI
```

---

## Client Usage (SOS Service)

```typescript
import RealtimeServiceClient from './services/realtime-service.client';

const realtimeClient = new RealtimeServiceClient();

// When someone joins
await realtimeClient.broadcastParticipantJoined({
  sosId: '507f1f77bcf86cd799439011',
  userId: '507f1f77bcf86cd799439012',
  userType: 'rescuer',
  displayName: 'John Rescue',
});

// When someone leaves
await realtimeClient.broadcastParticipantLeft({
  sosId: '507f1f77bcf86cd799439011',
  userId: '507f1f77bcf86cd799439012',
});

// Get active participants
const participants = await realtimeClient.getActiveParticipants('507f1f77bcf86cd799439011');

// Get participant count
const count = await realtimeClient.getParticipantCount('507f1f77bcf86cd799439011');
```

---

## Error Handling
- All errors are logged but don't block the operation
- If realtime service is unavailable, participant is still saved in DB
- Socket events may not broadcast, but API continues to function
