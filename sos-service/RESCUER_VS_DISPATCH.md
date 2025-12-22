# Rescuer vs Dispatch Module - Architecture Clarification

## Quick Summary

| Aspect | Rescuer Module | Dispatch Module |
|--------|---|---|
| **API Access** | Rescuer app/device | Internal service only |
| **Caller** | Individual rescuer | Dispatch Service (backend) |
| **Data Flow** | Pull-based | Push-based |
| **Status Transitions** | Distance-triggered | Assignment-triggered |
| **Authentication** | `X-User-Role: rescuer` | Internal service auth |
| **Endpoints** | 2 endpoints | 1 endpoint |

---

## Rescuer Module (`src/modules/rescuer/`)

### Purpose
Minimal interface for active rescuers in the field. Rescuers pull their assignment and push location updates.

### Endpoints

#### 1. GET `/api/rescuer/assignment`
**Called by**: Rescuer app/device (when they open the app or request assignment)
**Headers**:
```
X-User-Role: rescuer
X-User-Id: rescuer_4
X-City-Id: city_manila
```

**Response**:
```json
{
  "sosId": "sos_8fd12",
  "target": {
    "lat": 14.8532,
    "lng": 120.8141
  },
  "status": "EN_ROUTE"
}
```

**Logic**:
- Find SOS assigned to this rescuer
- Only return if status is `EN_ROUTE` or `ARRIVED`
- Returns target location and current SOS status

---

#### 2. POST `/api/rescuer/location`
**Called by**: Rescuer app/device (periodically, every 5-10 seconds)
**Headers**:
```
X-User-Role: rescuer
X-User-Id: rescuer_4
X-City-Id: city_manila
```

**Body**:
```json
{
  "lat": 14.8520,
  "lng": 120.8130
}
```

**Backend Logic**:
1. Find SOS assigned to rescuer_4
2. Calculate distance between rescuer location and SOS target
3. **If distance < 20m**: Auto-transition status to `ARRIVED`
4. Publish `LOCATION_UPDATED` event (Socket.IO broadcasts)
5. Return distance to target

**Response**:
```json
{
  "sosId": "sos_8fd12",
  "status": "ARRIVED",
  "distance": 18.5
}
```

### Key Points
- ✅ Rescuer **cannot** manually change status
- ✅ Status changes are **automatic** (backend-driven)
- ✅ No UI buttons like "Mark as Arrived"
- ✅ Pure location-based triggers
- ✅ Rescuer is "stateless" (service doesn't track them)

---

## Dispatch Module (`src/modules/dispatch/`)

### Purpose
Internal backend service that assigns rescuers to SOS cases. Called by a separate **Dispatch Service** (not in scope of sos-service).

### Endpoint

#### POST `/api/internal/dispatch/assign`
**Called by**: Dispatch Service (backend service, not client)
**Headers**:
```
X-City-Id: city_manila
```
(No user headers needed; internal service auth optional)

**Body**:
```json
{
  "sosId": "sos_8fd12",
  "rescuerId": "rescuer_4"
}
```

**Backend Logic**:
1. Verify SOS exists and is in `ACTIVE` status
2. Set `assignedRescuerId` to rescuer_4
3. **Auto-transition status to `EN_ROUTE`**
4. Publish `RESCUER_ASSIGNED` event
5. Return confirmation

**Response**:
```json
{
  "sosId": "sos_8fd12",
  "rescuerId": "rescuer_4",
  "status": "EN_ROUTE",
  "message": "Rescuer assigned successfully"
}
```

### Key Points
- ✅ Called by **Dispatch Service** (backend logic)
- ✅ No rescuer involvement
- ✅ Automatically transitions SOS to `EN_ROUTE`
- ✅ Next state change triggered by rescuer location update

---

## Workflow Example

### Scenario: Citizen creates SOS, Dispatch assigns rescuer

**Step 1: Citizen Creates SOS**
```
POST /api/sos
X-User-Role: citizen
→ Status: ACTIVE
→ Event: SOS_CREATED
```

**Step 2: Dispatch Service Assigns Rescuer**
```
POST /api/internal/dispatch/assign
Body: { sosId: "sos_8fd12", rescuerId: "rescuer_4" }
→ Status: ACTIVE → EN_ROUTE (automatic)
→ Event: RESCUER_ASSIGNED
```

**Step 3: Rescuer App Gets Assignment**
```
GET /api/rescuer/assignment
X-User-Role: rescuer
X-User-Id: rescuer_4
← Returns SOS details and target location
```

**Step 4: Rescuer Pushes Location (Every 5 seconds)**
```
POST /api/rescuer/location
Body: { lat: 14.8520, lng: 120.8130 }
→ Distance check (internal)
→ If distance < 20m: Status EN_ROUTE → ARRIVED (automatic)
→ Event: STATUS_CHANGED
```

**Step 5: Admin Closes SOS**
```
POST /api/sos/{sosId}/close
X-User-Role: admin
→ Status: ARRIVED → RESOLVED
→ Event: SOS_RESOLVED
```

---

## Key Architectural Differences

### Rescuer Module: Pull-Based, Reactive
- Rescuer **pulls** their assignment when needed
- Rescuer **pushes** their location periodically
- Status changes are **reactions** to location data
- No state is stored about the rescuer
- Rescuer is stateless (ephemeral)

### Dispatch Module: Push-Based, Deterministic
- Dispatch Service **pushes** the assignment
- Assignment is deterministic (made by algorithm/admin)
- Status is immediately set to `EN_ROUTE`
- No distance calculations needed
- Rescuer doesn't interact with this endpoint

---

## Why Two Modules?

### Separation of Concerns
1. **Rescuer Module**: Real-time device interaction, location tracking
2. **Dispatch Module**: Assignment logic, orchestration

### Scalability
- Dispatch assigns all rescuers without waiting for responses
- Rescuer module is lightweight (just location updates)
- Can scale independently

### Security
- Rescuer endpoints require rescuer credentials
- Dispatch endpoints are internal-only (service-to-service)
- Different auth requirements

### Extensibility
- Can replace dispatch algorithm without touching rescuer endpoints
- Can add multiple dispatch strategies
- Rescuer app remains simple and focused

---

## Event Flow

```
Citizen Creates SOS
    ↓
[SOS_CREATED event]
    ↓
Dispatch Service Assigns Rescuer
    ↓
[RESCUER_ASSIGNED event]
    ↓ (Auto-transition)
Status: ACTIVE → EN_ROUTE
    ↓
Rescuer App Gets Assignment
    ↓
Rescuer Pushes Location
    ↓
[LOCATION_UPDATED event]
    ↓ (Distance check)
If distance < 20m:
    Status: EN_ROUTE → ARRIVED
    ↓
[STATUS_CHANGED event]
    ↓
Admin Closes SOS
    ↓
[SOS_RESOLVED event]
```

---

## Summary

- **Rescuer Module**: For rescuers in the field (app-to-backend)
- **Dispatch Module**: For dispatch system (backend-to-backend)
- **Both use events**: Status changes are decoupled via event pub/sub
- **No coupling**: Rescuer app doesn't know about dispatch service
- **Automatic**: Status transitions happen in the backend, not the client

This separation ensures the sos-service is focused, scalable, and extensible.
