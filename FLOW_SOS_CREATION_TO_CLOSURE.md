# SOS Flow: Creation to Closure

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CITIZEN (Mobile Client)                       │
│                          (BFF-Citizen)                           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─────────────────────────────────────────────────────┐
             │                                                     │
       (HTTP)│                                            (WebSocket)
             │                                                     │
             ▼                                                     ▼
    ┌────────────────────┐                           ┌──────────────────────┐
    │   SOS Service      │                           │  Realtime Service    │
    │  (REST API)        │                           │  (Socket.IO)         │
    │                    │                           │                      │
    │ - Create SOS       │◄──────────────────────────┤ - Broadcasts         │
    │ - Location update  │  POST /location-snapshot  │ - Samples location   │
    │ - Close SOS        │                           │ - Room management    │
    │ - Database         │                           │ - Redis cache        │
    └────────────────────┘                           └──────────────────────┘
             │                                                     ▲
             │                                                     │
             └─────────────────────────────────────────────────────┘
                        (Sync via snapshots)
```

---

## Detailed Step-by-Step Flow

### 1️⃣ **CREATE SOS** (with Realtime Init)

```
CITIZEN (BFF-Citizen)
    │
    ├─ POST /api/sos
    │  ├─ type, message, silent
    │  └─ citizenId, location
    │
    ▼
BFF-CITIZEN (SOS Aggregator)
    │
    ├─ Step 1: Call SOS Service
    │  │
    │  ▼
    │  SOS SERVICE
    │  ├─ Create SOS in MongoDB
    │  │  ├─ sosId (generated)
    │  │  ├─ status: 'active'
    │  │  ├─ citizenId
    │  │  ├─ location: { lat, lng }
    │  │  └─ createdAt: timestamp
    │  │
    │  └─ Response: { sosId, status, createdAt }
    │
    ├─ Step 2: Call Realtime Service (parallel)
    │  │
    │  ▼
    │  REALTIME SERVICE
    │  ├─ Initialize Redis
    │  ├─ Create room: sos:${sosId}
    │  │
    │  └─ Response: { sosId, status, initialized: true }
    │
    └─ Response to Citizen: { sosId, status, createdAt, realtimeInitialized: true }
```

---

### 2️⃣ **INITIALIZE REALTIME CONTEXT**

```
BFF-CITIZEN (After SOS Created)
    │
    ├─ Calls: RealtimeServiceClient.initSosContext()
    │  ├─ sosId
    │  ├─ citizenId
    │  └─ location
    │
    ▼
REALTIME SERVICE
    │
    ├─ Receive: POST /api/sos/init
    │  ├─ sosId
    │  ├─ citizenId
    │  └─ location
    │
    ├─ Store in Redis:
    │  └─ sos:sosId → {
    │      sosId,
    │      citizenId,
    │      status: 'active',
    │      location: { lat, lng },
    │      createdAt: timestamp
    │    }
    │
    └─ Response: { success: true, data: state }
    
    ┌─────────────────────────────────────────────────┐
    │ Status: Ready for socket connections            │
    │ Client can now connect and join socket room     │
    └─────────────────────────────────────────────────┘
```

---

### 3️⃣ **CLIENT CONNECTS (SOCKET)**

```
CITIZEN (Mobile Client)
    │
    ├─ Emit: SOS_INIT { sosId }
    │  (Redis is already ready from step 2)
    │
    ▼
REALTIME SERVICE (Socket Handler)
    │
    ├─ socket.on('sos:init')
    │
    ├─ Actions:
    │  ├─ socket.join(`sos:${sosId}`)
    │  │  (Room already exists from init)
    │  │
    │  └─ Broadcast to room: user_joined event
    │
    └─ Status: Socket connected to SOS room
       (Can immediately start receiving location broadcasts)
```

---

### 4️⃣ **SEND LOCATION UPDATES (CONTINUOUS)**

```
CITIZEN (Mobile Client)
    │
    ├─ Emit: LOCATION_UPDATE { latitude, longitude, accuracy }
    │  └─ Every 5-10 seconds (client-side throttle)
    │
    ▼
REALTIME SERVICE
    │
    ├─ Socket Handler: registerLocationEvents
    │
    ├─ Step 1: BROADCAST (immediate)
    │  └─ io.to(`sos:${sosId}`).emit('location:broadcast', {
    │      userId, sosId, latitude, longitude, accuracy, timestamp
    │    })
    │  └─ All clients in room see location INSTANTLY
    │
    ├─ Step 2: SAMPLE (decide to persist)
    │  │
    │  ├─ LocationSampler.shouldSave() checks:
    │  │  ├─ Distance threshold: moved > 50 meters?
    │  │  └─ Time threshold: > 15 seconds since last save?
    │  │
    │  └─ If threshold exceeded:
    │     │
    │     ├─ POST http://govph-sos:3000/api/sos/{sosId}/location-snapshot
    │     │  ├─ latitude, longitude, accuracy
    │     │  └─ Fire-and-forget (async, non-blocking)
    │     │
    │     └─ Log: "Location snapshot persisted"
    │
    └─ Status: Realtime broadcast done, snapshot queued
```

---

### 5️⃣ **SAVE LOCATION SNAPSHOT (INTELLIGENT PERSIST)**

```
REALTIME SERVICE (Location Sampler)
    │
    ├─ Triggered only when:
    │  ├─ Distance moved > 50 meters, OR
    │  └─ Time elapsed > 15 seconds
    │
    ├─ POST /api/sos/{sosId}/location-snapshot
    │  ├─ latitude
    │  ├─ longitude
    │  └─ accuracy
    │
    ▼
SOS SERVICE
    │
    ├─ Controller: saveLocationSnapshot
    │
    ├─ No auth check (internal service only)
    │
    ├─ Save to MongoDB:
    │  └─ sos:${sosId} → {
    │      ...previous data...
    │      lastKnownLocation: { lat, lng },
    │      lastLocationUpdate: timestamp
    │    }
    │
    └─ Response: { success: true, data: updated_sos }
```

---

### 6️⃣ **CITIZEN CLOSES SOS**

```
CITIZEN (Mobile Client)
    │
    ├─ Emit: SOS_CLOSE { sosId }
    │
    ▼
REALTIME SERVICE (Socket Handler)
    │
    ├─ socket.on('sos:close')
    │
    ├─ Actions:
    │  ├─ Broadcast to room: SOS_CLOSE event
    │  ├─ socket.leave(`sos:${sosId}`)
    │  └─ locationSampler.cleanup(sosId)
    │
    └─ Status: Socket disconnected from room
```

---

### 7️⃣ **ADMIN CLOSES SOS (FINAL)**

```
ADMIN (BFF via SOS Service)
    │
    ├─ POST /api/sos/{sosId}/close
    │  └─ resolutionNote
    │
    ▼
SOS SERVICE
    │
    ├─ StatusMachine.closeSOS()
    │
    ├─ Update MongoDB:
    │  └─ sos:${sosId} → {
    │      ...all location history...
    │      status: 'closed',
    │      closedAt: timestamp,
    │      resolutionNote
    │    }
    │
    ├─ (Optional) Notify Realtime Service
    │  └─ POST /api/sos/{sosId}/close (could trigger cleanup)
    │
    └─ Response: { sosId, status: 'closed' }
```

---

## Data Flow Summary

### ✅ What SOS Service Owns
- **Database (MongoDB)**: Complete SOS record
- **Lifecycle**: Create → Active → Closed
- **History**: All locations, messages, status changes
- **Persistence**: Permanent storage

### ✅ What Realtime Service Owns
- **Redis Cache**: Active session state only
- **WebSocket**: Live client connections
- **Broadcasting**: Instant updates to clients
- **Sampling**: Smart decision on what to save

### 🔄 Communication
```
┌─────────────────────────────────────────────┐
│  SOS Service ←→ Realtime Service            │
├─────────────────────────────────────────────┤
│                                             │
│  → POST /location-snapshot                  │
│    (Realtime tells SOS: save this)          │
│                                             │
│  ← POST /init                               │
│    (SOS tells Realtime: start tracking)     │
│                                             │
│  ← POST /close                              │
│    (SOS tells Realtime: cleanup)            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Key Metrics

| Phase | Location Updates | Broadcast Latency | DB Saves |
|-------|-----------------|------------------|----------|
| Normal (moving) | Every 5-10s | < 100ms | Every 15s or 50m |
| Stationary | Every 5-10s | < 100ms | 1st only |
| High-speed rescue | Every 5-10s | < 100ms | Every 15s (max) |

---

## Example Timeline (Real Scenario)

```
T=0:00    Citizen creates SOS (via BFF)
          ├─ BFF calls SOS Service: Create in DB ✓
          ├─ BFF calls Realtime Service: Init Redis ✓
          └─ Both calls complete within ~500ms

T=0:05    Citizen opens mobile app
          └─ Socket connect to realtime ✓
          └─ Join sos:12345 room ✓
          └─ (Room ready, no initialization needed)

T=0:10    Citizen sends location (lat: 10.1, lng: 120.1)
          ├─ Broadcast to room ✓
          ├─ Sampler: First location, save it ✓
          └─ SOS Service: Update lastKnownLocation ✓

T=0:20    Citizen sends location (lat: 10.11, lng: 120.11)
          ├─ Broadcast to room ✓ (moved 1km)
          ├─ Sampler: > 50m moved ✓
          └─ SOS Service: Update lastKnownLocation ✓

T=0:30    Citizen sends location (lat: 10.115, lng: 120.115)
          ├─ Broadcast to room ✓
          ├─ Sampler: Only 500m moved, but 20s elapsed ✓
          └─ SOS Service: Update lastKnownLocation ✓

T=2:00    Admin closes SOS
          ├─ SOS Service: status = 'closed' ✓
          └─ Realtime Service: Cleanup redis entry ✓

T=2:01    SOS Complete
          ├─ History stored in SOS DB ✓
          └─ Redis cleaned up ✓
```

---

## Architecture Decision: Why This Split?

| Concern | SOS Service | Realtime Service |
|---------|------------|-----------------|
| **Speed** | Database (slower) | Redis (fast) |
| **Persistence** | ✓ Forever | ✗ Temp (TTL) |
| **Live Updates** | ✗ No | ✓ Socket.IO |
| **History** | ✓ Complete | ✗ Not needed |
| **Scaling** | Grows with data | Grows with connections |
| **Failure Impact** | Critical | Can recover |

✅ **Result**: Fast realtime + persistent history + no DB overload
