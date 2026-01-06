# SOS Participants API - BFF Citizen
## Frontend Integration Guide

**Service:** BFF Citizen  
**Base URL:** `http://bff-citizen:3000/api/sos`  
**Version:** 1.0  
**Last Updated:** January 7, 2026

---

## Overview

The SOS Participants API for Citizens allows users to join and manage their participation in active SOS incidents as responders or participants. All endpoints require JWT authentication via the Authorization header.

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

**Token Payload (Required Fields):**
```typescript
{
  id: string;           // User ID
  userId: string;       // Alternative user ID field
  role: string;         // User role (citizen, rescuer, admin)
  actor: {
    type: string;       // Actor type (USER, ANON)
  };
}
```

---

## API Endpoints

### 1. Join a SOS as Participant

**Endpoint:**
```
POST /api/sos/:sosId/participants/join
```

**Authentication:** Required (JWT)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID (MongoDB ObjectId) |

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userType": "citizen|rescuer"
}
```

**Request Body Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userType | string | No | User type (overrides JWT role). Defaults to JWT role or citizen |

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "sosId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "userType": "citizen",
    "status": "ACTIVE",
    "joinedAt": "2026-01-07T10:30:00Z",
    "leftAt": null,
    "actorType": "USER"
  },
  "timestamp": "2026-01-07T10:30:00Z"
}
```

**Response Data Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Participant record ID |
| sosId | string | Associated SOS ID |
| userId | string | User ID |
| userType | string | User type in system |
| status | string | Current status (ACTIVE, INACTIVE) |
| joinedAt | ISO8601 | Timestamp when joined |
| leftAt | ISO8601 \| null | Timestamp when left (null if active) |
| actorType | string | Actor type from JWT (USER, ANON) |

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required parameter: sosId"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized - User ID required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Error joining SOS"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://bff-citizen:3000/api/sos/507f1f77bcf86cd799439011/participants/join \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"userType": "citizen"}'
```

---

### 2. Leave a SOS Participation

**Endpoint:**
```
PATCH /api/sos/:sosId/participants/:userId/leave
```

**Authentication:** Required (JWT)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |
| userId | string | User ID to remove |

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{}
```
(Empty body required for PATCH)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Participant left SOS",
  "timestamp": "2026-01-07T10:35:00Z"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required parameters: sosId, userId"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Error leaving SOS"
}
```

**Example Request (cURL):**
```bash
curl -X PATCH http://bff-citizen:3000/api/sos/507f1f77bcf86cd799439011/participants/507f1f77bcf86cd799439012/leave \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

---

### 3. Get Active Participants

**Endpoint:**
```
GET /api/sos/:sosId/participants/active
```

**Authentication:** Required (JWT)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439020",
      "sosId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "userType": "citizen",
      "status": "ACTIVE",
      "joinedAt": "2026-01-07T10:30:00Z",
      "leftAt": null,
      "actorType": "USER"
    },
    {
      "id": "507f1f77bcf86cd799439021",
      "sosId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439013",
      "userType": "rescuer",
      "status": "ACTIVE",
      "joinedAt": "2026-01-07T10:32:00Z",
      "leftAt": null,
      "actorType": "USER"
    }
  ],
  "count": 2,
  "timestamp": "2026-01-07T10:35:00Z"
}
```

**Response Data Fields:**
Same as Join endpoint participant object

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required parameter: sosId"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Error fetching active participants"
}
```

**Example Request (cURL):**
```bash
curl -X GET http://bff-citizen:3000/api/sos/507f1f77bcf86cd799439011/participants/active \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 4. Get Participant History

**Endpoint:**
```
GET /api/sos/:sosId/participants/history
```

**Authentication:** Required (JWT)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439020",
      "sosId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "userType": "citizen",
      "status": "ACTIVE",
      "joinedAt": "2026-01-07T10:30:00Z",
      "leftAt": null,
      "actorType": "USER"
    },
    {
      "id": "507f1f77bcf86cd799439022",
      "sosId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439014",
      "userType": "rescuer",
      "status": "INACTIVE",
      "joinedAt": "2026-01-07T10:25:00Z",
      "leftAt": "2026-01-07T10:28:00Z",
      "actorType": "USER"
    }
  ],
  "count": 2,
  "timestamp": "2026-01-07T10:35:00Z"
}
```

**Includes:**
- Active participants (leftAt = null)
- Inactive participants (leftAt has value)
- Sorted by joinedAt (newest first)

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required parameter: sosId"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Error fetching participant history"
}
```

**Example Request (cURL):**
```bash
curl -X GET http://bff-citizen:3000/api/sos/507f1f77bcf86cd799439011/participants/history \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 5. Check Active Participation

**Endpoint:**
```
GET /api/sos/:sosId/participants/:userId/check
```

**Authentication:** Required (JWT)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |
| userId | string | User ID to check |

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isActive": true
  },
  "timestamp": "2026-01-07T10:35:00Z"
}
```

**Response Data Fields:**
| Field | Type | Description |
|-------|------|-------------|
| isActive | boolean | True if user is currently active in SOS |

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required parameters: sosId, userId"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Error checking participation status"
}
```

**Example Request (cURL):**
```bash
curl -X GET http://bff-citizen:3000/api/sos/507f1f77bcf86cd799439011/participants/507f1f77bcf86cd799439012/check \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 6. Get User's Participation History

**Endpoint:**
```
GET /api/sos/:sosId/participants/user/:userId/history
```

**Authentication:** Required (JWT)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |
| userId | string | User ID |

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439020",
      "sosId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "userType": "citizen",
      "status": "ACTIVE",
      "joinedAt": "2026-01-07T10:30:00Z",
      "leftAt": null,
      "actorType": "USER"
    },
    {
      "id": "507f1f77bcf86cd799439023",
      "sosId": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439012",
      "userType": "citizen",
      "status": "INACTIVE",
      "joinedAt": "2026-01-07T09:15:00Z",
      "leftAt": "2026-01-07T09:45:00Z",
      "actorType": "USER"
    }
  ],
  "count": 2,
  "timestamp": "2026-01-07T10:35:00Z"
}
```

**Returns:** All SOS participations for the user (active and inactive)

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required parameter: userId"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Error fetching user participation history"
}
```

**Example Request (cURL):**
```bash
curl -X GET http://bff-citizen:3000/api/sos/507f1f77bcf86cd799439011/participants/user/507f1f77bcf86cd799439012/history \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## WebSocket Integration

When a participant joins/leaves, the realtime service broadcasts socket events to all connected clients in the SOS room:

### Participant Joined Event
```javascript
socket.on('participant:joined', {
  sosId: "507f1f77bcf86cd799439011",
  userId: "507f1f77bcf86cd799439012",
  userType: "citizen",
  displayName: "John Citizen",
  joinedAt: "2026-01-07T10:30:00Z",
  timestamp: 1673085000000
});
```

### Participant Left Event
```javascript
socket.on('participant:left', {
  sosId: "507f1f77bcf86cd799439011",
  userId: "507f1f77bcf86cd799439012",
  leftAt: "2026-01-07T10:35:00Z",
  timestamp: 1673085300000
});
```

---

## Frontend Usage Examples

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

const useParticipants = (sosId: string, token: string) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch active participants
  const fetchActive = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://bff-citizen:3000/api/sos/${sosId}/participants/active`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setParticipants(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching participants');
    } finally {
      setLoading(false);
    }
  };

  // Join as participant
  const join = async (userType?: string) => {
    try {
      const response = await fetch(
        `http://bff-citizen:3000/api/sos/${sosId}/participants/join`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userType }),
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchActive();
        return data.data;
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error joining SOS');
    }
  };

  // Leave SOS
  const leave = async (userId: string) => {
    try {
      const response = await fetch(
        `http://bff-citizen:3000/api/sos/${sosId}/participants/${userId}/leave`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchActive();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error leaving SOS');
    }
  };

  // Check if user is participating
  const checkParticipation = async (userId: string) => {
    try {
      const response = await fetch(
        `http://bff-citizen:3000/api/sos/${sosId}/participants/${userId}/check`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        return data.data.isActive;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    fetchActive();
  }, [sosId]);

  return { 
    participants, 
    loading, 
    error, 
    join, 
    leave, 
    checkParticipation,
    fetchActive 
  };
};

// Usage in component
function ParticipantsList({ sosId, token, currentUserId }) {
  const { participants, join, leave, checkParticipation } = useParticipants(sosId, token);
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    checkParticipation(currentUserId).then(setIsParticipating);
  }, [currentUserId]);

  return (
    <div>
      <h3>Active Participants ({participants.length})</h3>
      {!isParticipating ? (
        <button onClick={() => join()}>Join as Responder</button>
      ) : (
        <button onClick={() => leave(currentUserId)}>Leave</button>
      )}
      <ul>
        {participants.map((p) => (
          <li key={p.id}>
            {p.userType} - {p.userId}
            {p.status === 'ACTIVE' && <span className="badge">Active</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Use Cases

### Scenario 1: Citizen Creates SOS and Needs Help
1. Citizen creates SOS via POST /api/sos
2. System automatically adds citizen as participant
3. Citizen shares SOS ID with nearby rescuers
4. Rescuers join via POST /api/sos/:sosId/participants/join
5. All participants see location updates via WebSocket

### Scenario 2: Rescuer Monitoring Active Incident
1. Rescuer views nearby SOS incidents
2. Rescuer joins relevant incidents as responder
3. Rescuer gets real-time location updates
4. When incident resolved, rescuer leaves via PATCH

### Scenario 3: Tracking Response History
1. User calls GET /api/sos/:sosId/participants/user/:userId/history
2. Get all past participations
3. See which incidents they helped with
4. Track response time and effectiveness

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST (join)
- `400 Bad Request` - Missing/invalid parameters
- `401 Unauthorized` - Missing or invalid JWT token
- `500 Internal Server Error` - Server-side error

---

## Rate Limiting

No rate limiting is currently implemented. Clients should implement reasonable request intervals to avoid overwhelming the server.

---

## Pagination

None of the endpoints support pagination at this time. All results are returned in full.

---

## Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| sosId | string | MongoDB ObjectId of SOS request |
| userId | string | MongoDB ObjectId of user or device ID for anonymous |
| userType | string | Type: 'citizen', 'rescuer', 'admin' |
| actorType | string | Type: 'USER' or 'ANON' |
| status | string | 'ACTIVE' or 'INACTIVE' |
| joinedAt | ISO8601 | UTC timestamp |
| leftAt | ISO8601 \| null | UTC timestamp or null if active |

---

## Change Log

### v1.0 (January 7, 2026)
- Initial release for BFF Citizen
- All 6 endpoints implemented
- WebSocket integration for real-time updates
- Full error handling
- React hook examples provided
