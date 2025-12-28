# Messaging with Socket & BFF Architecture Guide

## Overview

This document outlines the high-level architecture for real-time messaging in the Gov-Ph SOS system, including the BFF (Backend For Frontend) layer and WebSocket integration for real-time communication.

## System Architecture

```
┌─────────────────────────────────────────┐
│      CLIENT APPLICATIONS                │
│  (Web, Mobile - Citizen/Admin)          │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │      NGINX          │
        │  (Port 80/443)      │
        │  SSL + Proxy        │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        │ HTTP              WebSocket
        │ (REST API)        (WSS)
        │                     │
    ┌───▼──────┐         ┌────▼──────────┐
    │   KONG   │         │ REALTIME-     │
    │ (Gateway)│         │ SERVICE       │
    └───┬──────┘         │ (Port 3004)   │
        │                │               │
    ┌───▼──────────┐     │ • WebSocket   │
    │              │     │ • Redis       │
    │  BFF LAYER   │     │ • Socket.IO   │
    │              │     └───────────────┘
    │ • Citizen    │
    │   (3002)     │
    │ • Admin      │
    │   (3003)     │
    └───┬──────────┘
        │
    ┌───▼───────────────────────┐
    │   MICROSERVICES           │
    │                           │
    │ • SOS Service (3001)      │
    │ • Identity Service (3005) │
    │ • Geo Service             │
    └───────────────────────────┘
```

### Route Summary

| Request Type | Path | Purpose |
|---|---|---|
| **HTTP API** | Client → NGINX → KONG → BFF → Services | REST endpoints (messages, SOS mgmt, auth) |
| **WebSocket** | Client → NGINX → REALTIME-SERVICE | Real-time events (message broadcast, typing) |

## Messaging Flow

### 1. Message Sending Flow

```
Client Request
    │
    ├─ POST /api/messages/:sosId
    │
    ▼
BFF-CITIZEN (HTTP)
    │
    ├─ Validate user context & authentication
    ├─ Extract userId, role, senderDisplayName
    │
    ▼
SOS-SERVICE (REST)
    │
    ├─ Validate SOS exists & user has access
    ├─ Create message in MongoDB
    ├─ Emit message to Redis channel
    │
    ▼
REALTIME-SERVICE (Socket)
    │
    ├─ Receive message from Redis
    ├─ Broadcast to all connected clients in SOS room
    │
    ▼
Connected Clients (via WebSocket)
    │
    └─ Receive real-time message update
```

### 2. Message Retrieval Flow

```
Client Request
    │
    ├─ GET /api/messages/:sosId?skip=0&limit=50
    │
    ▼
BFF-CITIZEN (HTTP)
    │
    ├─ Validate user authentication
    │
    ▼
SOS-SERVICE (REST)
    │
    ├─ Query MongoDB for messages
    ├─ Apply pagination (skip/limit)
    ├─ Sort by createdAt
    │
    ▼
Response to Client
    │
    └─ messages[], total, skip, limit
```

## BFF Layer Architecture

### BFF-CITIZEN Messaging Module

The BFF layer acts as an aggregation and orchestration point between client applications and backend services.

#### Directory Structure

```
bff-citizen/src/modules/messages/
├── index.ts                  # Module exports
├── message.types.ts         # TypeScript interfaces
├── message.aggregator.ts    # Business logic orchestration
├── message.controller.ts    # HTTP request handling
└── message.routes.ts        # Route definitions
```

#### Component Responsibilities

**message.controller.ts**
- Handles HTTP requests
- Validates request parameters
- Extracts user context from middleware
- Returns consistent JSON responses

**message.aggregator.ts**
- Orchestrates message operations
- Coordinates with SOS Service Client
- Handles data transformation
- Manages error handling

**message.routes.ts**
- Defines HTTP endpoints
- Attaches user context middleware
- Routes requests to controller methods

**message.types.ts**
- Defines data models
- Ensures type safety
- Documents API contracts

### API Endpoints

#### Send Message
```
POST /api/messages/:sosId

Request Body:
{
  "senderDisplayName": "string",
  "contentType": "text" | "system",  // optional, defaults to "text"
  "content": "string"
}

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "sosId": "string",
    "senderType": "citizen" | "admin" | "rescuer",
    "senderId": "string",
    "senderDisplayName": "string",
    "contentType": "text" | "system",
    "content": "string",
    "createdAt": "ISO8601 timestamp"
  }
}
```

#### Get Messages
```
GET /api/messages/:sosId?skip=0&limit=50

Query Parameters:
- skip: number (pagination offset)
- limit: number (max 50 per page)

Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "sosId": "string",
      "senderType": "citizen" | "admin" | "rescuer",
      "senderId": "string",
      "senderDisplayName": "string",
      "contentType": "text" | "system",
      "content": "string",
      "createdAt": "ISO8601 timestamp"
    }
  ],
  "pagination": {
    "total": number,
    "skip": number,
    "limit": number
  }
}
```

#### Get Single Message
```
GET /api/messages/message/:messageId

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "sosId": "string",
    "senderType": "citizen" | "admin" | "rescuer",
    "senderId": "string",
    "senderDisplayName": "string",
    "contentType": "text" | "system",
    "content": "string",
    "createdAt": "ISO8601 timestamp"
  }
}
```

## WebSocket Integration (Realtime-Service)

### Important: Message Persistence via HTTP Only

⚠️ **CRITICAL**: Messages are created and persisted **exclusively via HTTP** to the SOS Service.
The WebSocket serves only for **real-time broadcasting** to connected clients.
Clients should **NOT** send messages through WebSocket.

### Socket Events Reference

#### Message Events

**`message:broadcast`** - New message broadcast to all clients in SOS room
```javascript
socket.on('message:broadcast', (data) => {
  // Emitted by server when message is persisted
  // data: {
  //   id: string,
  //   sosId: string,
  //   senderType: 'citizen' | 'admin' | 'rescuer',
  //   senderId: string | null,
  //   senderDisplayName: string,
  //   contentType: 'text' | 'system',
  //   content: string,
  //   createdAt: ISO8601
  // }
});
```

**`message:typing:start`** - User started typing
```javascript
socket.emit('message:typing:start', {
  sosId: "string",
  displayName: "string"
});

socket.on('message:typing:start', (data) => {
  // Broadcast when someone starts typing
  // data: { sosId, userId, displayName }
});
```

**`message:typing:stop`** - User stopped typing
```javascript
socket.emit('message:typing:stop', {
  sosId: "string"
});

socket.on('message:typing:stop', (data) => {
  // Broadcast when someone stops typing
  // data: { sosId, userId }
});
```

**`message:history:request`** - Request recent message history
```javascript
socket.emit('message:history:request', {
  sosId: "string",
  limit: 50
});
```

**`error`** - Error event from server
```javascript
socket.on('error', (data) => {
  // data: { code: string, message: string }
});
```

#### Participant Events

**`sos:room:join`** - Join socket room for SOS realtime updates
```javascript
socket.emit('sos:room:join', {
  sosId: "string"
});
```

**`sos:room:leave`** - Leave socket room
```javascript
socket.emit('sos:room:leave', {
  sosId: "string"
});
```

**`participant:joined:broadcast`** - Someone joined the SOS
```javascript
socket.on('participant:joined:broadcast', (data) => {
  // data: { sosId, userType: 'admin' | 'rescuer', userId, displayName }
});
```

**`participant:left:broadcast`** - Someone left the SOS
```javascript
socket.on('participant:left:broadcast', (data) => {
  // data: { sosId, userType: 'admin' | 'rescuer', userId }
});
```

**`participants:active:request`** - Query active participants in room
```javascript
socket.emit('participants:active:request', {
  sosId: "string"
});
```

#### SOS Events

**`sos:init`** - Initialize SOS (join room)
```javascript
socket.emit('sos:init', {
  sosId: "string"
});
```

**`sos:close`** - SOS closed (leave room)
```javascript
socket.emit('sos:close', {
  sosId: "string"
});
```

**`sos:status:update`** - SOS status changed
```javascript
socket.on('sos:status:broadcast', (data) => {
  // data: { sosId, status: string, timestamp }
});
```

#### Location Events

**`location:update`** - Broadcast location update
```javascript
socket.emit('location:update', {
  sosId: "string",
  latitude: number,
  longitude: number,
  accuracy: number
});

socket.on('location:broadcast', (data) => {
  // data: { sosId, userId, latitude, longitude, accuracy, timestamp }
});
```

### Socket Room Architecture

Messages and events are organized in socket rooms by SOS ID:
- **Room Name**: `sos:{sosId}` (colon-separated format)
- **Participants**: Citizen + Assigned Rescuers + Dispatchers
- **Access Control**: Validated via JWT token on socket connection
- **Lifecycle**: Room created on first join, cleaned up when last participant leaves

## Data Flow - Complete Example

### Citizen Sends Message via BFF (HTTP Only)

```
1. Client sends HTTP POST
   POST /api/messages/sos-123
   Body: {
     "senderDisplayName": "Maria Santos",
     "content": "I need immediate help at Makati Avenue"
   }

2. BFF-CITIZEN receives request
   - Middleware: authContextMiddleware
   - Extracted context: { user: { id: "citizen-456", role: "citizen" } }

3. MessageController.sendMessage()
   - Validates sosId, senderDisplayName, content
   - Creates MessagePayload with userId and role
   - Calls MessageAggregator

4. MessageAggregator.sendMessage()
   - Calls sosClient.sendMessage()
   - Handles error responses

5. SOS-SERVICE receives request
   - Validates citizen access to SOS
   - Creates message in MongoDB
   - Publishes to Redis channel
   - Returns 201 Created response with message object

6. REALTIME-SERVICE subscribes to Redis
   - Receives message event from Redis pub/sub
   - Broadcasts to socket room: `sos:123`
   - Emits `message:broadcast` event to all connected clients

7. Connected clients in room receive event
   - socket.on('message:broadcast', callback)
   - UI updates with new message in real-time
   - No database roundtrip needed (message already persisted)

8. HTTP response returns to BFF client
   - StatusCode: 201 Created
   - Includes: message ID, sender info, content, createdAt timestamp
```

### System Event Flow - SOCKET_EVENTS Constants

The socket events are defined in `services/realtime-service/src/utils/constants.ts`:

```typescript
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Location
  LOCATION_UPDATE: 'location:update',
  LOCATION_BROADCAST: 'location:broadcast',
  
  // SOS
  SOS_INIT: 'sos:init',
  SOS_CLOSE: 'sos:close',
  SOS_STATUS_UPDATE: 'sos:status:update',
  SOS_STATUS_BROADCAST: 'sos:status:broadcast',
  
  // Messages
  MESSAGE_SEND: 'message:send',
  MESSAGE_BROADCAST: 'message:broadcast',
  
  // Participants
  PARTICIPANT_JOINED: 'participant:joined',
  PARTICIPANT_LEFT: 'participant:left',
  
  // System
  RECONNECT_ATTEMPT: 'reconnect:attempt',
  ERROR: 'error',
};
```

### Communication Pattern: HTTP + WebSocket

1. **HTTP for State Changes** (messages, participant joins, location snapshots)
   - Ensures data is persisted before broadcast
   - Returns confirmation with IDs
   - Allows proper error handling
   - Single source of truth in database

2. **WebSocket for Real-time Broadcasts** (message:broadcast, participant:joined:broadcast, etc.)
   - Instant delivery to connected clients
   - No persistence needed (already done via HTTP)
   - Reduced latency for UI updates
   - Broadcast to all interested parties

## Authentication & Authorization

### User Context Flow

```
Client Request (with JWT in Authorization header)
    │
    ▼
API Gateway / BFF
    │
    ├─ authContextMiddleware
    │  ├─ Validates JWT token
    │  ├─ Extracts user info
    │  ├─ Attaches to req.context
    │
    ▼
Route Handler
    │
    ├─ Access req.context.user
    │  ├─ userId
    │  ├─ role (citizen|admin|rescuer)
    │  ├─ actor.type
    │  └─ actor.cityCode
    │
    └─ Pass to service via UserContext
```

### Message Sender Types

- **citizen**: Individual filing SOS
- **admin**: Dispatcher or admin personnel
- **rescuer**: Rescue personnel assigned to SOS

## Error Handling

### BFF Layer Error Response

```json
{
  "success": false,
  "error": "Missing required field: sosId"
}
```

### HTTP Status Codes

- **201 Created**: Message sent successfully
- **200 OK**: Messages retrieved successfully
- **400 Bad Request**: Missing/invalid parameters
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: SOS or message not found
- **500 Internal Server Error**: Server error

## Pagination Strategy

Messages are paginated to improve performance with large conversations:

```
Default: limit=50, skip=0
Maximum limit: 50 messages per request

Examples:
- First 50: GET /api/messages/sos-123
- Next 50: GET /api/messages/sos-123?skip=50&limit=50
- Latest 20: GET /api/messages/sos-123?skip=0&limit=20
```

## Message Content Limits

- **Maximum length**: 2000 characters per message
- **Content types**: 'text' or 'system'
- **System messages**: Auto-generated messages (SOS created, closed, etc.)

## Performance Considerations

### Database Optimization
- Compound index on `(sosId, createdAt)` for fast retrieval
- Index on `sosId` for filtering messages by conversation

### Caching Strategy
- Recent messages cached in Redis
- Pagination reduces memory footprint
- Socket broadcasting for real-time delivery

### Scalability
- SOS Service handles persistence
- Realtime Service handles live connections
- BFF aggregates and validates
- Load balancing across instances possible

## Security Considerations

1. **Authentication**: JWT token validation required
2. **Authorization**: User can only access their own SOS messages
3. **Input Validation**: Message content validated for length and type
4. **Rate Limiting**: Consider implementing per-user message rate limits
5. **Encryption**: Messages encrypted in transit (HTTPS/WSS)

## Development Guidelines

### Adding New Message Features

1. Update `message.types.ts` - Add new interface
2. Update `message.aggregator.ts` - Add business logic
3. Update `message.controller.ts` - Add HTTP handler
4. Update `message.routes.ts` - Add route definition
5. Update `SosServiceClient` - Add service method if needed
6. Test with both HTTP and WebSocket clients

### Testing Considerations

- Unit test aggregator logic
- Integration test HTTP endpoints
- E2E test socket events
- Validate pagination boundaries
- Test error scenarios

## Integration Points

### With SOS-SERVICE
- REST API for CRUD operations
- Message persistence in MongoDB
- Redis pub/sub for real-time events

### With REALTIME-SERVICE
- WebSocket server for live updates
- Redis channel subscriptions
- Socket room management

### With IDENTITY-SERVICE
- JWT token validation
- User role verification

## Related Documentation

- [SOS Service Implementation](./SPECIFICATION_IMPLEMENTED.md)
- [Realtime Messaging Guide](./services/realtime-service/REALTIME_MESSAGING_GUIDE.md)
- [Socket Specifications](./SOCKET_SPECS.md)
- [API Routing Debug](./API_ROUTING_DEBUG.md)

---

**Last Updated**: December 27, 2025
**Version**: 1.1
**Status**: Active - Aligned with Code Implementation
