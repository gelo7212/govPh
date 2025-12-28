# Realtime Messaging & Participants - Event Documentation

## 🎯 Architecture Principles

- **SOS Service (HTTP)** = Authority & Persistence
- **Realtime Service (Socket.IO)** = UI Transport Only
- Socket **NEVER** writes to MongoDB
- HTTP **ALWAYS** creates/updates audit records
- Socket is **stateless** and **disposable**

---

## 📨 Message Events

### Flow Diagram

```text
Client Sends Message
    ↓
HTTP POST /messages/{sosId}/messages
    ↓
SOS Service validates & persists
    ↓
SOS Service calls Realtime Service
    ↓
socket.emit('message:broadcast')
    ↓
Realtime broadcasts to all in sos:{sosId}
    ↓
All clients receive message instantly
```

### 1. `message:broadcast`

**Emitted by:** SOS Service (via HTTP call to Realtime Service)

**Direction:** Server → All Clients in Room

**Payload:**
```json
{
  "id": "msg_001",
  "sosId": "SOS-2025-000123",
  "senderType": "citizen|admin|rescuer",
  "senderId": "ObjectId|null",
  "senderDisplayName": "Juan Dela Cruz",
  "contentType": "text|system",
  "content": "May bata po dito sa bubong",
  "createdAt": "2025-12-27T10:30:00Z",
  "timestamp": 1703675400000
}
```

**Usage (Frontend):**
```typescript
socket.on('message:broadcast', (message) => {
  // Message already persisted in DB
  // Just update UI
  addMessageToChat(message);
});
```

**Important:**
- ✅ Message is ALREADY in database
- ✅ Includes all fields from sos_messages collection
- ❌ Do NOT use this for submission (use HTTP)

---

### 2. `message:typing:start`

**Emitted by:** Client → Realtime Service

**Direction:** Client → Server

**Payload:**
```json
{
  "sosId": "SOS-2025-000123",
  "displayName": "Juan Dela Cruz"
}
```

**Server broadcasts as:** `message:typing:broadcast`

**Broadcast Payload:**
```json
{
  "userId": "user_123",
  "displayName": "Juan Dela Cruz",
  "sosId": "SOS-2025-000123",
  "timestamp": 1703675400000
}
```

**Usage (Frontend):**
```typescript
// When user starts typing
socket.emit('message:typing:start', {
  sosId: currentSOS.id,
  displayName: currentUser.name
});

// Listen for others typing
socket.on('message:typing:broadcast', (data) => {
  showTypingIndicator(data.displayName);
});
```

**Important:**
- ❌ No database persistence
- ❌ No audit trail
- ✅ Pure UI convenience
- ✅ Auto-clears on disconnect

---

### 3. `message:typing:stop`

**Emitted by:** Client → Realtime Service

**Direction:** Client → Server

**Payload:**
```json
{
  "sosId": "SOS-2025-000123"
}
```

**Server broadcasts as:** `message:typing:stopped`

**Broadcast Payload:**
```json
{
  "userId": "user_123",
  "sosId": "SOS-2025-000123",
  "timestamp": 1703675400000
}
```

**Usage (Frontend):**
```typescript
// When user stops typing or submits
socket.emit('message:typing:stop', {
  sosId: currentSOS.id
});

socket.on('message:typing:stopped', (data) => {
  hideTypingIndicator(data.userId);
});
```

---

### 4. `message:history:request`

**Emitted by:** Client → Realtime Service

**Direction:** Client → Server (Informational only)

**Payload:**
```json
{
  "sosId": "SOS-2025-000123",
  "limit": 50,
  "skip": 0
}
```

**Server responds with:** `message:history:response`

**Response Payload:**
```json
{
  "sosId": "SOS-2025-000123",
  "message": "Please fetch messages via HTTP GET /messages/{sosId}/messages",
  "timestamp": 1703675400000
}
```

**Usage (Frontend):**
```typescript
// DO NOT rely on socket for history
// Always use HTTP:

const response = await fetch(
  `/api/messages/${sosId}/messages?limit=50&skip=0`
);
const data = await response.json();
loadMessages(data.data);

// Optional: Emit this to trigger server logging
socket.emit('message:history:request', {
  sosId,
  limit: 50,
  skip: 0
});
```

**Important:**
- ✅ Messages must come from HTTP (authoritative)
- ❌ Do not try to fetch history via socket
- ❌ Socket history is UI-only telemetry

---

## 👥 Participant Events

### Flow Diagram (Join)

```text
Client wants to join SOS
    ↓
HTTP POST /sos/{sosId}/participants/join
    ↓
SOS Service creates participant record (audit)
    ↓
SOS Service calls Realtime Service
    ↓
socket.emit('participant:joined:broadcast')
    ↓
Realtime broadcasts to all in sos:{sosId}
    ↓
All clients update participant list
    ↓
Client also:
    socket.emit('sos:room:join')  (separate event)
    ↓
Client joins socket room (for messages, etc)
```

---

### 1. `sos:room:join`

**Emitted by:** Client → Realtime Service

**Direction:** Client → Server

**Payload:**
```json
{
  "sosId": "SOS-2025-000123",
  "userType": "admin|rescuer|citizen",
  "displayName": "Juan Dela Cruz"
}
```

**Server broadcasts to others as:** `sos:room:joined`

**Broadcast Payload:**
```json
{
  "userId": "user_123",
  "sosId": "SOS-2025-000123",
  "userType": "admin",
  "displayName": "Juan Dela Cruz",
  "socketId": "socket_abc123",
  "timestamp": 1703675400000
}
```

**Usage (Frontend - Before this, call HTTP endpoint):**
```typescript
// Step 1: Create participant record via HTTP
const participantResponse = await fetch(
  `/api/sos/${sosId}/participants/join`,
  {
    method: 'POST',
    body: JSON.stringify({
      userType: 'admin',
      userId: currentUser.id
    })
  }
);

// Step 2: Join socket room
socket.emit('sos:room:join', {
  sosId,
  userType: 'admin',
  displayName: currentUser.name
});

// Step 3: Listen for others joining
socket.on('sos:room:joined', (data) => {
  addParticipantToList(data);
});
```

**Important:**
- ✅ Socket room is SEPARATE from participant record
- ✅ HTTP creates audit trail
- ✅ Socket just enables realtime updates
- ❌ Socket join does NOT create participant record

---

### 2. `sos:room:leave`

**Emitted by:** Client → Realtime Service

**Direction:** Client → Server

**Payload:**
```json
{
  "sosId": "SOS-2025-000123"
}
```

**Server broadcasts as:** `sos:room:left`

**Broadcast Payload:**
```json
{
  "userId": "user_123",
  "sosId": "SOS-2025-000123",
  "socketId": "socket_abc123",
  "timestamp": 1703675400000
}
```

**Usage (Frontend - Before this, call HTTP endpoint):**
```typescript
// Step 1: Close participant record via HTTP
const leaveResponse = await fetch(
  `/api/sos/${sosId}/participants/${userId}/leave`,
  { method: 'PATCH' }
);

// Step 2: Leave socket room
socket.emit('sos:room:leave', {
  sosId
});

// Step 3: Listen for others leaving
socket.on('sos:room:left', (data) => {
  removeParticipantFromList(data.userId);
});
```

**Important:**
- ✅ HTTP closes participant record (leftAt timestamp)
- ✅ Socket leaves realtime room
- ✅ These are coordinated but separate operations

---

### 3. `participant:joined:broadcast`

**Emitted by:** SOS Service (via HTTP call to Realtime Service)

**Direction:** Server → All Clients in Room

**Payload:**
```json
{
  "sosId": "SOS-2025-000123",
  "userId": "user_456",
  "userType": "admin",
  "displayName": "Maria Santos",
  "joinedAt": "2025-12-27T10:30:00Z",
  "timestamp": 1703675400000
}
```

**Server emits as:** `participant:joined`

**Usage (Frontend):**
```typescript
socket.on('participant:joined', (data) => {
  // Participant already in database
  // Just update UI
  addParticipantToActiveList(data);
  showNotification(`${data.displayName} joined the SOS`);
});
```

**Important:**
- ✅ Data already in sos_participants collection
- ✅ Includes `joinedAt` from audit trail
- ❌ This is broadcast-only, not a request

---

### 4. `participant:left:broadcast`

**Emitted by:** SOS Service (via HTTP call to Realtime Service)

**Direction:** Server → All Clients in Room

**Payload:**
```json
{
  "sosId": "SOS-2025-000123",
  "userId": "user_456",
  "leftAt": "2025-12-27T11:45:00Z",
  "timestamp": 1703675400000
}
```

**Server emits as:** `participant:left`

**Usage (Frontend):**
```typescript
socket.on('participant:left', (data) => {
  // Participant already marked left in database
  // Just update UI
  removeParticipantFromActiveList(data.userId);
  showNotification(`Participant left the SOS`);
});
```

**Important:**
- ✅ Data already updated in sos_participants (leftAt set)
- ✅ Socket automatically leaves room
- ✅ Used for audit accountability

---

### 5. `participant:joined:broadcast` (emitted by client)

**Emitted by:** Client → Realtime Service

**Direction:** Client → Server

**Alternative:** Some architectures emit this from client after HTTP success

**Payload:**
```json
{
  "sosId": "SOS-2025-000123",
  "userId": "user_456",
  "userType": "admin",
  "displayName": "Maria Santos",
  "joinedAt": "2025-12-27T10:30:00Z"
}
```

**Usage (Optional - if you want client to trigger broadcast):**
```typescript
// After successful HTTP join:
const result = await participantService.join(...);

// Optionally emit to trigger broadcast
socket.emit('participant:joined:broadcast', result);
```

**Important:**
- ⚠️ This is OPTIONAL pattern
- ✅ Better pattern: SOS Service emits after creating record
- ⚠️ Avoid if possible (prefer server-initiated broadcasts)

---

### 6. `participants:active:request`

**Emitted by:** Client → Realtime Service

**Direction:** Client → Server

**Payload:**
```json
{
  "sosId": "SOS-2025-000123"
}
```

**Server responds with:** `participants:active:response`

**Response Payload:**
```json
{
  "sosId": "SOS-2025-000123",
  "participants": [
    {
      "userId": "user_123",
      "displayName": "Juan Dela Cruz",
      "userType": "citizen",
      "socketId": "socket_abc123",
      "connectedAt": 1703675400000
    },
    {
      "userId": "user_456",
      "displayName": "Maria Santos",
      "userType": "admin",
      "socketId": "socket_def456",
      "connectedAt": 1703675420000
    }
  ],
  "count": 2,
  "timestamp": 1703675400000
}
```

**Usage (Frontend):**
```typescript
// Get live socket presence (not authoritative)
socket.emit('participants:active:request', {
  sosId
});

socket.on('participants:active:response', (data) => {
  // This is who's currently connected via socket
  // NOT the same as database participants
  setOnlineParticipants(data.participants);
});
```

**Important:**
- ⚠️ This is SOCKET PRESENCE ONLY
- ❌ Do NOT use for participant list (use HTTP)
- ✅ Use for "online" indicator
- ✅ Includes socketId (socket-level tracking)

---

## 🔄 Integration Pattern (SOS Service → Realtime Service)

### When SOS Service creates a message:

```typescript
// SOS Service
const message = await messageService.sendMessage({...});

// Call Realtime Service to broadcast
await realtimeClient.emit('message:broadcast', {
  sosId: message.sosId,
  message: message
});
```

### When participant joins:

```typescript
// SOS Service
const participant = await participantService.joinSos(...);

// Notify Realtime Service
await realtimeClient.emit('participant:joined:broadcast', {
  sosId: participant.sosId,
  userId: participant.userId,
  userType: participant.userType,
  displayName: user.displayName,
  joinedAt: participant.joinedAt
});
```

### When participant leaves:

```typescript
// SOS Service
await participantService.leaveSos(sosId, userId);

// Notify Realtime Service
await realtimeClient.emit('participant:left:broadcast', {
  sosId,
  userId,
  leftAt: new Date()
});
```

---

## ⚠️ Critical Rules

### For Messaging

- ✅ Messages ALWAYS created via HTTP
- ✅ Socket only BROADCASTS messages
- ❌ Never emit `message:send` to create message
- ✅ Typing indicators are UI-only
- ❌ Never persist typing state

### For Participants

- ✅ Participant records created via HTTP
- ✅ Socket broadcasts participant changes
- ✅ Socket room join is SEPARATE from participant
- ❌ Never create participant record via socket
- ✅ Always close participant via HTTP first
- ✅ Auto-close all active participants when SOS ends

---

## 📊 Data Ownership Matrix

| Data                    | HTTP Owner    | Socket Role        |
| ----------------------- | ------------- | ------------------ |
| Message content         | SOS Service   | Broadcast only     |
| Message persistence     | SOS Service   | N/A                |
| Participant audit trail | SOS Service   | Broadcast only     |
| Typing indicator        | N/A           | Broadcast only     |
| Online presence         | Realtime Srv  | Track connections  |
| Room membership         | Realtime Srv  | Join/leave rooms   |

---

## 🧠 Mental Model

> **Think of realtime service as a radio station:**
> - **HTTP is the newspaper** (official record)
> - **Socket is the radio** (instant broadcast)
> - Newspaper WRITES the news
> - Radio just REPEATS the news
> - Listeners tune in to radio for speed
> - Listeners trust newspaper for accuracy

