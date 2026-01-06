# SOS Service API Specifications
## Anonymous Rescuer Feature

**Version:** 1.0  
**Last Updated:** January 6, 2026  
**Service:** SOS Service (Emergency Response & Rescue Coordination)

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [WebSocket Events](#websocket-events)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

---

## Overview

The SOS Service is a microservice responsible for managing emergency requests, real-time location tracking, and rescue coordination. This specification document covers the **Anonymous Rescuer Feature**, enabling unregistered users (anonymous rescuers) to:

- View active SOS incidents in their area
- See real-time location updates of incidents
- Join/participate in ongoing rescue operations
- Receive real-time notifications of new incidents
- Access participant history and incident status

### Key Features

| Feature | Citizen | Rescuer | Admin | Anon Rescuer |
|---------|---------|---------|-------|--------------|
| Create SOS | ✅ | ❌ | ✅ | ✅* |
| View SOS | ✅ | ✅ | ✅ | ✅ |
| View Locations | Own only | All | All | All |
| Join SOS | ✅ | ✅ | ✅ | ✅ |
| Update Status | ❌ | ✅ | ✅ | ❌ |
| Close/Resolve | ❌ | ✅ | ✅ | ❌ |

*Anon rescuer can only create SOS with type "ANONYMOUS"

---

## Authentication & Authorization

### Authentication Methods

#### 1. **JWT Token Authentication** (Registered Users)
```
Header: Authorization: Bearer <jwt_token>
```

User payload in JWT:
```typescript
{
  id: string;           // User ID
  role: UserRole;       // CITIZEN | RESCUER | ADMIN
  cityId: string;       // City jurisdiction
  actor: {
    type: "USER";
    name: string;
  };
  iat: number;
  exp: number;
}
```

#### 2. **Anonymous Authentication** (Unregistered Users)
```
Header: Authorization: Bearer <anon_token>
OR
Header: X-Device-ID: <device_identifier>
```

Anonymous user payload:
```typescript
{
  actor: {
    type: "ANON";
    deviceId: string;    // Device identifier
  };
  cityId: string;        // Extracted from location/request
  iat: number;
  exp: number;
}
```

#### 3. **Device ID Header** (Optional)
```
Header: X-Device-ID: <unique_device_identifier>
```

Unique identifier for tracking anonymous user sessions (device-based).

### Role-Based Access Control (RBAC)

| Endpoint | CITIZEN | RESCUER | ADMIN | ANON |
|----------|---------|---------|-------|------|
| POST /sos | ✅ | ❌ | ✅ | ✅ |
| GET /sos | ✅ | ✅ | ✅ | ✅ |
| GET /sos/:sosId | ✅ | ✅ | ✅ | ✅ |
| POST /sos/:sosId/location | ✅ | ❌ | ❌ | ❌ |
| POST /sos/:sosId/close | ❌ | ✅ | ✅ | ❌ |
| POST /sos/:sosId/participants/join | ✅ | ✅ | ✅ | ✅ |
| GET /sos/:sosId/participants/active | ✅ | ✅ | ✅ | ✅ |
| GET /locations/:sosId | ✅ | ✅ | ✅ | ✅ |

---

## API Endpoints

### Base URL
```
http://sos-service:3000/api/v1
```

### SOS Management

#### **1. Create SOS Request**
Create a new emergency SOS request (Citizen, Admin, or Anonymous).

```
POST /sos
```

**Authentication:** Required (JWT or Anonymous)  
**Authorization:** CITIZEN, ADMIN, ANON

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
X-Device-ID: <device-id> (optional for anon)
```

**Request Body:**
```json
{
  "type": "FIRE|MEDICAL|ACCIDENT|CRIME|DISASTER|ANONYMOUS",
  "message": "Emergency description",
  "silent": false,
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "address": {
    "city": "Manila",
    "barangay": "Barangay 1"
  }
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Emergency type |
| message | string | Yes | Description of emergency (50-500 chars) |
| silent | boolean | No | Silent mode (no audio alerts). Default: false |
| location.latitude | number | Yes | GPS latitude coordinate |
| location.longitude | number | Yes | GPS longitude coordinate |
| address.city | string | Yes | City name |
| address.barangay | string | Yes | Barangay/district name |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "status": "ACTIVE",
    "type": "MEDICAL",
    "message": "Heart attack victim, unresponsive",
    "location": {
      "type": "Point",
      "coordinates": [120.9842, 14.5995]
    },
    "address": {
      "city": "Manila",
      "barangay": "Barangay 1"
    },
    "sosNo": "SOS-20260106-001",
    "createdAt": "2026-01-06T10:30:00Z",
    "updatedAt": "2026-01-06T10:30:00Z"
  },
  "timestamp": "2026-01-06T10:30:00Z"
}
```

**Error Responses:**
- 400: Bad Request (missing fields, invalid type)
- 403: Forbidden (unauthorized role)
- 409: Conflict (active SOS already exists)
- 500: Internal Server Error

---

#### **2. List SOS Requests**
Retrieve all active or filtered SOS requests in user's city.

```
GET /sos
GET /sos?status=ACTIVE
GET /sos?cityId=<cityId>
```

**Authentication:** Required  
**Authorization:** All roles

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: ACTIVE, EN_ROUTE, ARRIVED, RESOLVED, CANCELLED |
| cityId | string | City ID (optional, defaults to user's city) |
| limit | number | Results limit (default: 50) |
| offset | number | Pagination offset (default: 0) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "sosNo": "SOS-20260106-001",
      "status": "ACTIVE",
      "type": "MEDICAL",
      "message": "Heart attack victim",
      "createdAt": "2026-01-06T10:30:00Z",
      "updatedAt": "2026-01-06T10:30:00Z",
      "location": {
        "type": "Point",
        "coordinates": [120.9842, 14.5995]
      },
      "address": {
        "city": "Manila",
        "barangay": "Barangay 1"
      },
      "participantCount": 3,
      "assignedRescuerId": "507f1f77bcf86cd799439013"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 5
  },
  "timestamp": "2026-01-06T10:30:00Z"
}
```

---

#### **3. Get SOS Details**
Retrieve detailed information about a specific SOS request.

```
GET /sos/:sosId
```

**Authentication:** Required  
**Authorization:** All roles

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID (MongoDB ObjectId) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "sosNo": "SOS-20260106-001",
    "status": "ACTIVE",
    "type": "MEDICAL",
    "message": "Heart attack victim, unresponsive",
    "citizenId": "507f1f77bcf86cd799439012",
    "assignedRescuerId": "507f1f77bcf86cd799439013",
    "location": {
      "type": "Point",
      "coordinates": [120.9842, 14.5995]
    },
    "address": {
      "city": "Manila",
      "barangay": "Barangay 1"
    },
    "createdAt": "2026-01-06T10:30:00Z",
    "updatedAt": "2026-01-06T10:35:00Z",
    "resolvedAt": null,
    "participants": [
      {
        "userId": "507f1f77bcf86cd799439013",
        "userType": "RESCUER",
        "joinedAt": "2026-01-06T10:31:00Z",
        "status": "ACTIVE"
      },
      {
        "userId": "device-anon-12345",
        "userType": "ANON_RESCUER",
        "joinedAt": "2026-01-06T10:32:00Z",
        "status": "ACTIVE"
      }
    ]
  },
  "timestamp": "2026-01-06T10:30:00Z"
}
```

**Error Responses:**
- 404: SOS not found
- 400: Invalid SOS ID format

---

### Participant Management

#### **4. Join SOS**
Join an active SOS request as a rescuer or participant.

```
POST /sos/:sosId/participants/join
```

**Authentication:** Required (JWT or Anonymous)  
**Authorization:** RESCUER, CITIZEN, ADMIN, ANON

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |

**Request Body:**
```json
{
  "userType": "RESCUER|CITIZEN|ANON_RESCUER",
  "userId": "507f1f77bcf86cd799439012"
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userType | string | Yes | Type of participant joining |
| userId | string | Yes | User ID or device ID for anon |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "sosId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "userType": "ANON_RESCUER",
    "status": "ACTIVE",
    "joinedAt": "2026-01-06T10:32:00Z"
  },
  "timestamp": "2026-01-06T10:32:00Z"
}
```

**Error Responses:**
- 400: Invalid user type or missing fields
- 404: SOS not found or SOS not active
- 409: User already joined this SOS

---

#### **5. Leave SOS**
Leave an active SOS participation.

```
PATCH /sos/:sosId/participants/:userId/leave
```

**Authentication:** Required  
**Authorization:** RESCUER, CITIZEN, ADMIN, ANON

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |
| userId | string | User ID or device ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User left the SOS",
  "timestamp": "2026-01-06T10:35:00Z"
}
```

---

#### **6. Get Active Participants**
Retrieve list of currently active participants in a SOS.

```
GET /sos/:sosId/participants/active
```

**Authentication:** Required  
**Authorization:** All roles

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439020",
      "userId": "507f1f77bcf86cd799439013",
      "userName": "Juan Dela Cruz",
      "userType": "RESCUER",
      "status": "ACTIVE",
      "joinedAt": "2026-01-06T10:31:00Z",
      "role": "RESCUER"
    },
    {
      "id": "507f1f77bcf86cd799439021",
      "userId": "device-anon-12345",
      "userName": "Anonymous",
      "userType": "ANON_RESCUER",
      "status": "ACTIVE",
      "joinedAt": "2026-01-06T10:32:00Z"
    }
  ],
  "totalActive": 2,
  "timestamp": "2026-01-06T10:30:00Z"
}
```

---

#### **7. Get Participant History**
Retrieve all participants (active and inactive) in a SOS.

```
GET /sos/:sosId/participants/history
```

**Authentication:** Required  
**Authorization:** RESCUER, ADMIN, CITIZEN

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439020",
      "userId": "507f1f77bcf86cd799439013",
      "userType": "RESCUER",
      "status": "ACTIVE",
      "joinedAt": "2026-01-06T10:31:00Z",
      "leftAt": null
    },
    {
      "id": "507f1f77bcf86cd799439022",
      "userId": "device-anon-12345",
      "userType": "ANON_RESCUER",
      "status": "INACTIVE",
      "joinedAt": "2026-01-06T10:32:00Z",
      "leftAt": "2026-01-06T10:35:00Z"
    }
  ],
  "timestamp": "2026-01-06T10:30:00Z"
}
```

---

#### **8. Check Active Participation**
Check if a user is actively participating in a SOS.

```
GET /sos/:sosId/participants/:userId/check
```

**Authentication:** Required  
**Authorization:** All roles

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |
| userId | string | User ID or device ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "participantId": "507f1f77bcf86cd799439020",
    "status": "ACTIVE",
    "joinedAt": "2026-01-06T10:32:00Z"
  },
  "timestamp": "2026-01-06T10:30:00Z"
}
```

---

#### **9. Get User Participation History**
Retrieve all SOS incidents a user has participated in.

```
GET /participants/user/:userId/history
```

**Authentication:** Required  
**Authorization:** Own records or ADMIN

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID or device ID |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Results limit (default: 50) |
| offset | number | Pagination offset (default: 0) |
| status | string | Filter by SOS status |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "participantId": "507f1f77bcf86cd799439020",
      "sosId": "507f1f77bcf86cd799439011",
      "sosNo": "SOS-20260106-001",
      "sosType": "MEDICAL",
      "userType": "ANON_RESCUER",
      "joinedAt": "2026-01-06T10:32:00Z",
      "leftAt": null,
      "status": "ACTIVE",
      "sosStatus": "ACTIVE"
    },
    {
      "participantId": "507f1f77bcf86cd799439023",
      "sosId": "507f1f77bcf86cd799439024",
      "sosNo": "SOS-20260105-045",
      "sosType": "FIRE",
      "userType": "ANON_RESCUER",
      "joinedAt": "2026-01-05T14:20:00Z",
      "leftAt": "2026-01-05T15:10:00Z",
      "status": "INACTIVE",
      "sosStatus": "RESOLVED"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 15
  },
  "timestamp": "2026-01-06T10:30:00Z"
}
```

---

### Location Tracking

#### **10. Update Location**
Update citizen/rescuer location (realtime tracking).

```
POST /sos/:sosId/location
```

**Authentication:** Required (Citizen or Rescuer)  
**Authorization:** CITIZEN, RESCUER

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |

**Request Body:**
```json
{
  "latitude": 14.5995,
  "longitude": 120.9842,
  "accuracy": 10,
  "speed": 0
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| latitude | number | Yes | GPS latitude coordinate |
| longitude | number | Yes | GPS longitude coordinate |
| accuracy | number | No | GPS accuracy in meters |
| speed | number | No | Current speed (m/s) |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439030",
    "sosId": "507f1f77bcf86cd799439011",
    "location": {
      "type": "Point",
      "coordinates": [120.9842, 14.5995]
    },
    "accuracy": 10,
    "timestamp": "2026-01-06T10:32:00Z"
  },
  "timestamp": "2026-01-06T10:32:00Z"
}
```

---

#### **11. Get Location History**
Retrieve location history of a SOS incident.

```
GET /locations/:sosId
GET /locations/:sosId?limit=100&offset=0
```

**Authentication:** Required  
**Authorization:** All roles

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Results limit (default: 100) |
| offset | number | Pagination offset (default: 0) |
| startTime | ISO8601 | Filter from timestamp |
| endTime | ISO8601 | Filter to timestamp |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439030",
      "location": {
        "type": "Point",
        "coordinates": [120.9842, 14.5995]
      },
      "accuracy": 10,
      "timestamp": "2026-01-06T10:30:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439031",
      "location": {
        "type": "Point",
        "coordinates": [120.9845, 14.5998]
      },
      "accuracy": 8,
      "timestamp": "2026-01-06T10:32:00Z"
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 24
  },
  "timestamp": "2026-01-06T10:30:00Z"
}
```

---

### Messages

#### **12. Get Messages**
Retrieve messages for a SOS incident.

```
GET /sos/:sosId/messages
```

**Authentication:** Required  
**Authorization:** All roles

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sosId | string | SOS request ID |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Results limit (default: 50) |
| offset | number | Pagination offset (default: 0) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439040",
      "sosId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "userType": "RESCUER",
      "message": "ETA 5 minutes",
      "createdAt": "2026-01-06T10:31:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 12
  },
  "timestamp": "2026-01-06T10:30:00Z"
}
```

---

## Data Models

### SOS Model
```typescript
interface SOS {
  id: string;                          // MongoDB ObjectId
  sosNo: string;                       // SOS-YYYYMMDD-XXXXX
  status: 'ACTIVE' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED' | 'CANCELLED';
  type: 'FIRE' | 'MEDICAL' | 'ACCIDENT' | 'CRIME' | 'DISASTER' | 'ANONYMOUS';
  message: string;                     // Emergency description
  citizenId?: string;                  // Creator (null for anon)
  assignedRescuerId?: string;          // Assigned rescuer ID
  cityId: string;                      // City jurisdiction
  silent: boolean;                     // Silent mode
  lastKnownLocation: GeoJsonPoint;     // Latest location
  address: {
    city: string;
    barangay: string;
  };
  deviceId?: string;                   // Device ID (for anon tracking)
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Last update
  resolvedAt?: Date;                   // Resolution time
}

interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number];       // [longitude, latitude]
}
```

### Participant Model
```typescript
interface Participant {
  id: string;                          // MongoDB ObjectId
  sosId: string;                       // Associated SOS ID
  userId: string;                      // User ID or device ID
  userType: 'CITIZEN' | 'RESCUER' | 'ANON_RESCUER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: Date;
  leftAt?: Date;
  deviceId?: string;                   // Device ID (for anon users)
}
```

### Location Model
```typescript
interface Location {
  id: string;                          // MongoDB ObjectId
  sosId: string;                       // Associated SOS ID
  cityId: string;                      // City jurisdiction
  location: GeoJsonPoint;              // GeoJSON point
  accuracy?: number;                   // GPS accuracy in meters
  speed?: number;                      // Speed in m/s
  timestamp: Date;                     // When location was recorded
}
```

### Message Model
```typescript
interface Message {
  id: string;                          // MongoDB ObjectId
  sosId: string;                       // Associated SOS ID
  userId: string;                      // Message sender ID
  userType: 'CITIZEN' | 'RESCUER' | 'ANON_RESCUER' | 'ADMIN';
  message: string;                     // Message content
  attachments?: string[];              // Attachment URLs
  createdAt: Date;
  updatedAt: Date;
}
```

---

## WebSocket Events

### Connection & Authentication

```javascript
// Connect with authentication
const socket = io('http://sos-service:3000', {
  auth: {
    token: '<jwt_token>',
    deviceId: '<device-id>'  // optional for anon
  }
});

// Or with anonymous
const socket = io('http://sos-service:3000', {
  auth: {
    type: 'ANON',
    deviceId: '<unique-device-id>'
  }
});
```

### Real-Time Events

#### **SOS Status Update**
```javascript
socket.on('sos:updated', (data) => {
  console.log('SOS status changed:', data);
  // {
  //   sosId: '507f1f77bcf86cd799439011',
  //   status: 'EN_ROUTE',
  //   updatedAt: '2026-01-06T10:32:00Z'
  // }
});
```

#### **New Participant Joined**
```javascript
socket.on('participant:joined', (data) => {
  console.log('New participant:', data);
  // {
  //   sosId: '507f1f77bcf86cd799439011',
  //   participantId: '507f1f77bcf86cd799439020',
  //   userId: 'device-anon-12345',
  //   userType: 'ANON_RESCUER',
  //   joinedAt: '2026-01-06T10:32:00Z'
  // }
});
```

#### **Location Update**
```javascript
socket.on('location:updated', (data) => {
  console.log('Location changed:', data);
  // {
  //   sosId: '507f1f77bcf86cd799439011',
  //   location: {
  //     type: 'Point',
  //     coordinates: [120.9842, 14.5995]
  //   },
  //   accuracy: 10,
  //   timestamp: '2026-01-06T10:32:00Z'
  // }
});
```

#### **New Message**
```javascript
socket.on('message:new', (data) => {
  console.log('New message:', data);
  // {
  //   id: '507f1f77bcf86cd799439040',
  //   sosId: '507f1f77bcf86cd799439011',
  //   userId: 'device-anon-12345',
  //   userType: 'ANON_RESCUER',
  //   message: 'On my way!',
  //   createdAt: '2026-01-06T10:31:00Z'
  // }
});
```

#### **SOS Closed**
```javascript
socket.on('sos:closed', (data) => {
  console.log('SOS resolved:', data);
  // {
  //   sosId: '507f1f77bcf86cd799439011',
  //   status: 'RESOLVED',
  //   resolvedAt: '2026-01-06T10:45:00Z'
  // }
});
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  },
  "timestamp": "2026-01-06T10:30:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry or state conflict |
| 500 | Server Error | Internal server error |

### Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| AUTHENTICATION_ERROR | Authentication failed |
| AUTHORIZATION_ERROR | Permission denied |
| NOT_FOUND | Resource not found |
| DUPLICATE_SOS | Active SOS already exists |
| SOS_NOT_ACTIVE | SOS is not in active state |
| PARTICIPANT_ALREADY_JOINED | User already joined |
| MISSING_FIELD | Required field missing |
| INVALID_FORMAT | Invalid data format |
| INTERNAL_ERROR | Server error |

---

## Examples

### Frontend Example: Anonymous Rescuer Flow

#### 1. **Register as Anonymous**
```javascript
// Generate device ID (localStorage or session)
const deviceId = generateUUID();
localStorage.setItem('deviceId', deviceId);

// Get anonymous token from BFF
const authResponse = await fetch('/bff/auth/anonymous', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Device-ID': deviceId
  },
  body: JSON.stringify({
    deviceId: deviceId,
    location: {
      latitude: 14.5995,
      longitude: 120.9842
    }
  })
});

const { token } = await authResponse.json();
localStorage.setItem('anonToken', token);
```

#### 2. **View Active SOS in Area**
```javascript
const token = localStorage.getItem('anonToken');

const response = await fetch('/api/v1/sos?status=ACTIVE', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Device-ID': localStorage.getItem('deviceId')
  }
});

const { data: sosList } = await response.json();
// Display list of active SOS with map
displaySOSMap(sosList);
```

#### 3. **Join SOS as Anonymous Rescuer**
```javascript
const sosId = 'selected-sos-id';
const deviceId = localStorage.getItem('deviceId');

const response = await fetch(`/api/v1/sos/${sosId}/participants/join`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userType: 'ANON_RESCUER',
    userId: deviceId
  })
});

const { data: participant } = await response.json();
console.log('Joined SOS:', participant);
```

#### 4. **Track Location in Real-Time**
```javascript
// Start GPS tracking
navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    
    // Update location via REST API
    fetch(`/api/v1/sos/${sosId}/location`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        latitude,
        longitude,
        accuracy
      })
    });
  },
  (error) => console.error('GPS error:', error),
  { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
);
```

#### 5. **Subscribe to Real-Time Updates**
```javascript
// Connect to WebSocket
const socket = io('http://sos-service:3000', {
  auth: {
    token: localStorage.getItem('anonToken'),
    deviceId: localStorage.getItem('deviceId')
  }
});

// Listen for location updates
socket.on('location:updated', (data) => {
  console.log('SOS location updated:', data.location);
  updateMapMarker(data.sosId, data.location);
});

// Listen for new participants
socket.on('participant:joined', (data) => {
  console.log('New participant:', data.userType);
  updateParticipantsList();
});

// Listen for SOS status changes
socket.on('sos:updated', (data) => {
  if (data.status === 'RESOLVED') {
    showNotification('SOS has been resolved');
  }
});
```

#### 6. **Get Detailed SOS Information**
```javascript
const sosId = 'selected-sos-id';

const response = await fetch(`/api/v1/sos/${sosId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data: sosDetails } = await response.json();
console.log('SOS Details:', {
  type: sosDetails.type,
  message: sosDetails.message,
  location: sosDetails.location,
  activeParticipants: sosDetails.participants.filter(p => p.status === 'ACTIVE'),
  address: sosDetails.address
});
```

#### 7. **Leave SOS**
```javascript
const sosId = 'current-sos-id';
const deviceId = localStorage.getItem('deviceId');

const response = await fetch(
  `/api/v1/sos/${sosId}/participants/${deviceId}/leave`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

console.log('Left SOS');
```

---

### Backend Integration Example (Node.js)

```typescript
// Service integration
import axios from 'axios';

class SOSServiceClient {
  private baseURL = process.env.SOS_SERVICE_URL;
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async listActiveSOS(cityId: string): Promise<SOS[]> {
    const response = await axios.get(`${this.baseURL}/sos`, {
      params: { status: 'ACTIVE', cityId },
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.data.data;
  }

  async joinSOS(sosId: string, userId: string, userType: string): Promise<Participant> {
    const response = await axios.post(
      `${this.baseURL}/sos/${sosId}/participants/join`,
      { userId, userType },
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    return response.data.data;
  }

  async getLocationHistory(sosId: string): Promise<Location[]> {
    const response = await axios.get(
      `${this.baseURL}/locations/${sosId}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    return response.data.data;
  }
}
```

---

## Development Notes

### For Frontend Developers

1. **Device ID Management**
   - Generate unique device ID on first app load
   - Store in localStorage for persistence
   - Use consistent device ID for all anon operations

2. **Anonymous Authentication**
   - Request anonymous token from BFF on app startup
   - Include device ID in all requests
   - Token refresh handled automatically

3. **Real-Time Updates**
   - Connect to WebSocket for live SOS updates
   - Listen to location, participant, and message events
   - Automatically update UI without polling

4. **Location Tracking**
   - Use high-accuracy GPS when possible
   - Send updates at least every 30 seconds or on location change >50m
   - Handle permission denials gracefully

5. **Error Handling**
   - Implement retry logic for failed requests
   - Show user-friendly error messages
   - Log errors for debugging

### For Backend Developers

1. **Database Indexing**
   ```
   Indexes needed:
   - SOS: { cityId, status, createdAt }
   - SOS: { lastKnownLocation } (geospatial)
   - Location: { sosId, timestamp }
   - Participant: { sosId, userId, status }
   - Participant: { userId, sosId }
   ```

2. **Performance Considerations**
   - Use geospatial queries for location-based filtering
   - Implement pagination for all list endpoints
   - Cache active SOS list by city
   - Limit location history queries to last 24 hours

3. **Security**
   - Validate device IDs
   - Rate limit anonymous API calls
   - Sanitize all user inputs
   - Log all sensitive operations

4. **Monitoring**
   - Track SOS creation/resolution times
   - Monitor participant join/leave rates
   - Alert on high location update frequency
   - Dashboard for real-time incident tracking

---

## Deployment Checklist

- [ ] Set environment variables (DB connection, API keys)
- [ ] Configure CORS for BFF endpoints
- [ ] Enable HTTPS for production
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Enable request logging
- [ ] Configure WebSocket namespaces
- [ ] Set up monitoring and alerts
- [ ] Test anonymous flow end-to-end
- [ ] Load testing with multiple concurrent users

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-06 | Initial specification with anonymous rescuer support |

