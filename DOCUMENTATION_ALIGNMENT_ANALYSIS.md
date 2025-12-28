# Documentation vs Code Alignment Analysis

## Status: ⚠️ **MISALIGNMENTS FOUND**

The MESSAGING_SOCKET_BFF_GUIDE.md has several discrepancies with the actual implementation. Here's a detailed breakdown:

---

## 1. Socket Event Names - **CRITICAL MISMATCH**

### ❌ **Documented in Guide:**
```javascript
socket.on('message:new', (data) => { ... })
socket.emit('message:send', { ... })
socket.on('message:error', (data) => { ... })
```

### ✅ **Actual Code** (constants.ts):
```typescript
export const SOCKET_EVENTS = {
  MESSAGE_SEND: 'message:send',      // ← Note: underscore in constant
  MESSAGE_BROADCAST: 'message:broadcast',  // ← Not 'message:new'
};
```

### 📋 **Correct Events:**
- **Message Broadcast**: `message:broadcast` (server to clients)
- **Message Send**: `message:send` (client to server)
- **Typing Start**: `message:typing:start`
- **Typing Stop**: `message:typing:stop`
- **History Request**: `message:history:request`

---

## 2. Socket Room Naming - **MINOR MISMATCH**

### ❌ **Documented in Guide:**
```
Room Name: sos-{sosId}
```

### ✅ **Actual Code** (message.events.ts line 29):
```typescript
const roomName = `sos:${sosId}`;  // ← Uses colon, not dash
```

### 🔧 **Correction:**
- Room names use **colon format**: `sos:123` not `sos-123`
- Applies to all room references in socket code

---

## 3. Message Flow - **LOGIC CORRECTION**

### ❌ **Documented in Guide:**
```
Client can emit 'message:send' to send messages through WebSocket
↓
REALTIME-SERVICE broadcasts to room
```

### ✅ **Actual Code** (message.events.ts documentation):
```typescript
/**
 * IMPORTANT: This service only handles UI transport.
 * Messages are CREATED and PERSISTED via HTTP to SOS Service.
 * This just BROADCASTS them to all clients in the SOS room.
 */
```

### 📋 **Correct Flow:**
1. Client sends HTTP POST to `/api/messages/:sosId` (via BFF)
2. **SOS-SERVICE** persists message to MongoDB
3. **SOS-SERVICE** emits event to Redis
4. **REALTIME-SERVICE** receives from Redis
5. **REALTIME-SERVICE** broadcasts via socket `message:broadcast` event

**→ Clients should NOT send messages via WebSocket. Only HTTP.**

---

## 4. Participant Events - **MISMATCHED EVENT NAMES**

### ❌ **Documented in Guide:**
(No socket events documented for participants)

### ✅ **Actual Code** (constants.ts):
```typescript
PARTICIPANT_JOINED: 'participant:joined',
PARTICIPANT_LEFT: 'participant:left',
```

### ✅ **Actual Code** (participant.events.ts):
```typescript
socket.on('sos:room:join', ...)         // Socket room join
socket.on('sos:room:leave', ...)        // Socket room leave
socket.on('participant:joined:broadcast', ...)  // Participant joined broadcast
socket.on('participant:left:broadcast', ...)    // Participant left broadcast
socket.on('participants:active:request', ...)   // Query active participants
```

### 📋 **Participant Socket Events:**
| Event | Type | Purpose |
|-------|------|---------|
| `sos:room:join` | Client→Server | Join socket room for realtime updates |
| `sos:room:leave` | Client→Server | Leave socket room |
| `participant:joined:broadcast` | Server→Client | Someone joined (broadcast from SOS Service) |
| `participant:left:broadcast` | Server→Client | Someone left (broadcast from SOS Service) |
| `participants:active:request` | Client→Server | Query active socket-level participants |

---

## 5. API Endpoint Paths - **ROUTING CLARIFICATION**

### ✅ **Guide Documentation - CORRECT:**
```
POST /api/messages/:sosId
GET /api/messages/:sosId
GET /api/messages/message/:messageId
```

### ✅ **Actual Code Routing:**

**bff-citizen/src/app.ts:**
```typescript
app.use('/api/messages', messageRoutes);
```

**message.routes.ts:**
```typescript
router.post('/:sosId', ...)           // → POST /api/messages/:sosId ✅
router.get('/:sosId', ...)            // → GET /api/messages/:sosId ✅
router.get('/message/:messageId', ...) // → GET /api/messages/message/:messageId ✅
```

**Status:** ✅ **ALIGNED**

---

## 6. User Context in BFF - **CORRECT**

### ✅ **Guide Shows:**
```javascript
Extracted context: { user: { id: "citizen-456", role: "citizen" } }
```

### ✅ **Actual Code** (message.controller.ts):
```typescript
const userId = req.context?.user?.id;
const userRole = req.context?.user?.role;
const userContext: UserContext = {
  userId: req.context?.user?.id,
  role: req.context?.user?.role,
  cityId: req.context?.user?.actor?.cityCode,
  requestId: req.context?.requestId,
  actorType: req.context?.user?.actor?.type,
};
```

**Status:** ✅ **ALIGNED**

---

## 7. SOS Service Endpoints - **ROUTING STRUCTURE**

### Guide States:
```
SOS-SERVICE: REST API for messaging
```

### Actual Code (sos-service/src/app.ts):
```typescript
app.use('/api/sos', sosRoutes);
```

### Message Routes (message.routes.ts):
```typescript
router.post('/:sosId/messages', ...)       // → /api/sos/:sosId/messages
router.get('/:sosId/messages', ...)        // → /api/sos/:sosId/messages
router.get('/message/:messageId', ...)     // → /api/sos/message/:messageId
```

**Status:** ✅ **ALIGNED** (but could be clearer in guide)

---

## 8. WebSocket Room Access Control - **CORRECT**

### ✅ **Guide States:**
- Room Name: `sos-{sosId}`
- Participants: Citizen + Assigned Rescuers + Dispatchers
- Access Control: Validated via user context on socket connection

### ✅ **Actual Code** (sos.events.ts, participant.events.ts):
- User context validated during socket auth middleware
- Room access controlled by socket room membership
- Participants validated via HTTP before broadcasting

**Status:** ✅ **ALIGNED**

---

## 9. Typing Indicators - **UNDOCUMENTED IN GUIDE**

### ✅ **Actual Code** (message.events.ts):
```typescript
socket.on('message:typing:start', ...)   // Broadcast user is typing
socket.on('message:typing:stop', ...)    // Broadcast user stopped typing
```

**Status:** ⚠️ **Not documented in guide (missing feature)**

---

## 10. Location Events - **PARTIALLY DOCUMENTED**

### ✅ **Actual Code** (constants.ts):
```typescript
LOCATION_UPDATE: 'location:update',
LOCATION_BROADCAST: 'location:broadcast',
```

### ✅ **Guide Mentions:**
- Location updates in data flow
- Real-time location tracking

**Status:** ⚠️ **Documented but event names not explicit**

---

## Summary Table

| Feature | Guide | Code | Status |
|---------|-------|------|--------|
| Message broadcast event name | `message:new` | `message:broadcast` | ❌ Mismatch |
| Message send event name | Implied `message:send` | `message:send` | ✅ OK |
| Socket room naming | `sos-{sosId}` | `sos:{sosId}` | ❌ Mismatch |
| Message persistence location | HTTP → Service | HTTP → Service | ✅ OK |
| API endpoint paths | `/api/messages/:sosId` | `/api/messages/:sosId` | ✅ OK |
| User context extraction | ✅ Documented | ✅ Implemented | ✅ OK |
| Participant events | Not documented | Implemented | ⚠️ Missing |
| Typing indicators | Not documented | Implemented | ⚠️ Missing |
| Location events | Vague | Explicit | ⚠️ Missing |
| Authorization checks | ✅ Documented | ✅ Implemented | ✅ OK |
| Error handling | ✅ Documented | ✅ Implemented | ✅ OK |

---

## Required Guide Updates

### High Priority (Breaking Changes)
1. ❌ Update socket event names from `message:new` to `message:broadcast`
2. ❌ Update room naming convention from `sos-{sosId}` to `sos:{sosId}`
3. ❌ Clarify that messages are sent via HTTP, NOT WebSocket

### Medium Priority (Missing Documentation)
4. ⚠️ Add comprehensive participant socket events section
5. ⚠️ Add typing indicator events documentation
6. ⚠️ Expand location events documentation

### Low Priority (Clarifications)
7. ⚠️ Clarify SOS-SERVICE endpoint routing structure
8. ⚠️ Add SOCKET_EVENTS constants reference

---

## Next Steps

The guide should be updated with:
1. Corrected socket event names matching SOCKET_EVENTS constants
2. Corrected room naming with colons
3. Clear note that messages are sent via **HTTP only**
4. Complete socket event reference table
5. Proper event flow diagrams with actual event names

