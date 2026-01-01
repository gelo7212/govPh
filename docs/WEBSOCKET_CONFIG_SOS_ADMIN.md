# WebSocket Configuration - SOS Admin

## Overview
The SOS Admin module uses WebSocket connections to:
1. **Subscribe to location updates** from responders
2. **Subscribe to message broadcasts** from conversations

## Connection Details

### Base URL
```
ws://admin.localhost/socket.io/?token=<JWT_TOKEN>
wss://admin.localhost/socket.io/?token=<JWT_TOKEN>  (HTTPS)
```

### Authentication
All WebSocket connections require a valid JWT token in the query parameter:
```
/socket.io/?token=eyJhbGc...
```

The token must include:
- `userId` - Admin user ID
- `role` - User role (e.g., 'admin')
- `sosId` - Optional: Specific SOS request being managed

---

## Events

### 1. Location Updates

#### Subscribe to Location Updates
Listen for real-time location updates from responders.

**Event Name:** `location:broadcast`

**Payload:**
```typescript
{
  userId: string;           // Responder/citizen ID
  sosId: string;           // SOS request ID
  latitude: number;        // Location latitude
  longitude: number;       // Location longitude
  accuracy: number;        // GPS accuracy in meters
  timestamp: number;       // Unix timestamp
  deviceId: string;        // Device identifier
}
```

**Example (JavaScript):**
```javascript
import io from 'socket.io-client';

const token = 'your-jwt-token';
const socket = io('ws://admin.localhost', {
  query: { token }
});

socket.on('location:broadcast', (data) => {
  console.log('Location update:', data);
  // Update map with new coordinates
  // data.sosId, data.latitude, data.longitude, data.timestamp
});
```

**Room:** Automatically joined based on SOS context
- Room name: `sos:{sosId}`
- The admin automatically joins the room for their assigned SOS requests

---

### 2. Message Events

#### Subscribe to Message Broadcasts
Listen for new messages in SOS conversations.

**Event Name:** `message:broadcast`

**Payload:**
```typescript
{
  id: string;                    // Message ID
  sosId: string;                // SOS request ID
  senderType: 'SOS_ADMIN' | 'CITIZEN' | 'RESCUER';
  senderId: string | null;      // Sender user ID
  senderDisplayName: string;    // Display name
  contentType: 'text' | 'system';
  content: string;              // Message text
  createdAt: Date;             // Message creation time
  timestamp: number;           // Broadcast timestamp
}
```

**Example (JavaScript):**
```javascript
socket.on('message:broadcast', (data) => {
  console.log('New message:', data);
  // Add message to conversation UI
  // Display sender info and content
});
```

---

#### Typing Indicators (Optional)

**Event Names:**
- `message:typing:start` - User started typing
- `message:typing:stop` - User stopped typing

**Payload:**
```typescript
{
  sosId: string;
  displayName: string;  // Display name of typing user
}
```

---

### 3. SOS Status Events

#### Subscribe to SOS Status Updates
Listen for SOS request status changes.

**Event Name:** `sos:status:broadcast`

**Payload:**
```typescript
{
  sosId: string;
  status: 'ACTIVE' | 'ASSIGNED' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';
  updatedAt: Date;
  updatedBy: string;  // User who made the change
}
```

**Example:**
```javascript
socket.on('sos:status:broadcast', (data) => {
  console.log('SOS status changed:', data.sosId, data.status);
  // Update SOS card/list with new status
});
```

---

### 4. Participant Events

#### Join/Leave Notifications

**Event Names:**
- `participant:joined` - User joined the SOS room
- `participant:left` - User left the SOS room

**Payload:**
```typescript
{
  userId: string;
  userRole: 'SOS_ADMIN' | 'CITIZEN' | 'RESCUER';
  displayName: string;
  timestamp: number;
}
```

---

## Room Management

### Automatic Room Joining
When you connect with a valid JWT containing `sosId`:
```javascript
// Token payload:
{
  userId: "admin-123",
  role: "admin",
  sosId: "sos-456",  // <-- Auto-join this SOS room
}
```

The socket automatically joins: `sos:sos-456`

### Manual Room Management
If needed, join/leave specific SOS rooms:

```javascript
// Join a specific SOS room
socket.emit('join-room', { sosId: 'sos-789' });

// Leave a specific SOS room
socket.emit('leave-room', { sosId: 'sos-789' });
```

---

## Error Handling

### Common Error Events

**Event Name:** `error`

**Error Codes:**
```typescript
{
  code: 'UNAUTHORIZED_SOS';      // Not authorized to access this SOS
  code: 'INVALID_LOCATION';      // Bad location data
  code: 'INVALID_MESSAGE_DATA';  // Missing sosId or message
  code: 'INVALID_SOS_ID';        // Missing SOS ID in request
  code: 'MESSAGE_BROADCAST_ERROR'; // Failed to broadcast
}
```

**Example:**
```javascript
socket.on('error', (error) => {
  console.error('WebSocket error:', error.code, error.message);
});
```

---

## Nginx Configuration

The nginx config routes WebSocket traffic:

```nginx
location / {
    if ($http_upgrade != "websocket") {
        return 404;
    }
    proxy_pass http://realtime_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## Rate Limiting

- **API Rate Limit:** 100 requests/second per IP
- **WebSocket Rate Limit:** 50 connections/second per IP
- **Location Updates:** Throttled to 1 update per second per socket
- **Message Send:** No specific limit (controlled by HTTP API)

---

## Socket.IO Version
- **Version:** 4.x
- **Protocol:** WebSocket with fallback to HTTP long-polling
- **Namespace:** `/` (default)

---

## Implementation Example - React

```typescript
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSosWebSocket = (token: string, sosId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [locations, setLocations] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('ws://admin.localhost', {
      query: { token, sosId }
    });

    // Subscribe to location updates
    newSocket.on('location:broadcast', (data) => {
      setLocations(prev => [...prev, data]);
    });

    // Subscribe to messages
    newSocket.on('message:broadcast', (data) => {
      setMessages(prev => [...prev, data]);
    });

    // Subscribe to SOS status
    newSocket.on('sos:status:broadcast', (data) => {
      console.log('Status updated:', data);
    });

    // Error handling
    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, sosId]);

  return { socket, locations, messages };
};
```

---

## Troubleshooting

### Connection Not Established
- Check JWT token validity
- Verify nginx WebSocket configuration
- Check browser console for error messages
- Ensure token includes required claims

### Missing Location/Message Updates
- Verify socket is in correct room (`sos:{sosId}`)
- Check if location throttle is active (max 1 update/second)
- Verify user has correct role/permissions

### Connection Drops
- Implement auto-reconnect with exponential backoff
- Check network/firewall settings
- Monitor realtime service logs
