# Evacuation Center Admin API Specifications (BFF Admin)

## Base URL
```
/api/admin/evacuation-centers
```

## Authentication
All endpoints require:
- **Authentication:** Bearer token (JWT)
- **Authorization:** `APP_ADMIN` or `CITY_ADMIN` role
- **Actors:** Excludes `ANON` and `SHARE_LINK` actors

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all evacuation centers with optional filters |
| GET | `/:id` | Get specific evacuation center by ID |
| POST | `/` | Create new evacuation center |
| PUT | `/:id` | Update evacuation center |
| DELETE | `/:id` | Delete evacuation center |
| PATCH | `/:id/status` | Update evacuation center status |
| PATCH | `/:id/capacity` | Update evacuation center capacity |
| GET | `/:id/capacity` | Get available capacity information |

---

## 1. GET /evacuation-centers
**Get all evacuation centers with optional filtering**

Reusable endpoint for all list queries. Use query parameters to filter by city, status, active status, or any combination.

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cityId` | string | No | Filter by city ID |
| `status` | string | No | Filter by status (OPEN, FULL, CLOSED, STANDBY) |
| `isActive` | boolean | No | Filter by active status (true/false) |

### Request Examples
```http
# Get all evacuation centers
GET /api/admin/evacuation-centers
Authorization: Bearer {token}

# Get by city
GET /api/admin/evacuation-centers?cityId=city-001
Authorization: Bearer {token}

# Get open evacuation centers in a city
GET /api/admin/evacuation-centers?cityId=city-001&status=OPEN
Authorization: Bearer {token}

# Get active centers with FULL status
GET /api/admin/evacuation-centers?status=FULL&isActive=true
Authorization: Bearer {token}

# Get STANDBY centers in a city
GET /api/admin/evacuation-centers?cityId=city-001&status=STANDBY
Authorization: Bearer {token}

# Get all active centers by city
GET /api/admin/evacuation-centers?cityId=city-001&isActive=true
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "cityId": "city-001",
      "name": "Calumpit Central School Gym",
      "location": {
        "lat": 14.8505,
        "lng": 121.1245
      },
      "address": "Calumpit, Bulacan",
      "landmark": "Near the Municipal Hall",
      "capacity": {
        "maxIndividuals": 500,
        "maxFamilies": 100,
        "currentIndividuals": 245,
        "currentFamilies": 45
      },
      "status": "OPEN",
      "facilities": {
        "hasElectricity": true,
        "hasWater": true,
        "hasToilet": true,
        "hasMedicalArea": true,
        "hasGenerator": true,
        "hasInternet": false
      },
      "contactPerson": {
        "name": "John Doe",
        "phone": "+63912345678",
        "position": "Evacuation Center Manager"
      },
      "lastStatusUpdate": "2024-01-15T10:30:00.000Z",
      "notes": "Fully operational",
      "isActive": true,
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### Error Response (401 Unauthorized)
```json
{
  "success": false,
  "error": "Unauthorized - Token required or invalid role",
  "code": "AUTH_ERROR"
}
```

### Error Response (500)
```json
{
  "success": false,
  "error": "Failed to fetch evacuation centers",
  "code": "SERVICE_ERROR"
}
```

---

## 2. GET /evacuation-centers/:id
**Get a specific evacuation center by ID**

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Evacuation center MongoDB ID |

### Request Example
```http
GET /api/admin/evacuation-centers/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "cityId": "city-001",
    "name": "Calumpit Central School Gym",
    "location": {
      "lat": 14.8505,
      "lng": 121.1245
    },
    "address": "Calumpit, Bulacan",
    "landmark": "Near the Municipal Hall",
    "capacity": {
      "maxIndividuals": 500,
      "maxFamilies": 100,
      "currentIndividuals": 245,
      "currentFamilies": 45
    },
    "status": "OPEN",
    "facilities": {
      "hasElectricity": true,
      "hasWater": true,
      "hasToilet": true,
      "hasMedicalArea": true,
      "hasGenerator": true,
      "hasInternet": false
    },
    "contactPerson": {
      "name": "John Doe",
      "phone": "+63912345678",
      "position": "Evacuation Center Manager"
    },
    "lastStatusUpdate": "2024-01-15T10:30:00.000Z",
    "notes": "Fully operational",
    "isActive": true,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "error": "Evacuation center not found",
  "code": "NOT_FOUND"
}
```

---

## 3. POST /evacuation-centers
**Create a new evacuation center**

### Request Body (application/json)
```json
{
  "cityId": "city-001",
  "name": "Calumpit Central School Gym",
  "location": {
    "lat": 14.8505,
    "lng": 121.1245
  },
  "address": "Calumpit, Bulacan",
  "landmark": "Near the Municipal Hall",
  "capacity": {
    "maxIndividuals": 500,
    "maxFamilies": 100,
    "currentIndividuals": 0,
    "currentFamilies": 0
  },
  "status": "STANDBY",
  "facilities": {
    "hasElectricity": true,
    "hasWater": true,
    "hasToilet": true,
    "hasMedicalArea": true,
    "hasGenerator": true,
    "hasInternet": false
  },
  "contactPerson": {
    "name": "John Doe",
    "phone": "+63912345678",
    "position": "Evacuation Center Manager"
  },
  "notes": "Recently renovated"
}
```

### Required Fields
- `cityId` (string)
- `name` (string)
- `location` (object with `lat` and `lng`)
- `capacity` (object with `maxIndividuals` and `currentIndividuals`)
- `status` (string: OPEN, FULL, CLOSED, STANDBY)
- `facilities` (object with `hasElectricity`, `hasWater`, `hasToilet`)

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "cityId": "city-001",
    "name": "Calumpit Central School Gym",
    "location": {
      "lat": 14.8505,
      "lng": 121.1245
    },
    "address": "Calumpit, Bulacan",
    "landmark": "Near the Municipal Hall",
    "capacity": {
      "maxIndividuals": 500,
      "maxFamilies": 100,
      "currentIndividuals": 0,
      "currentFamilies": 0
    },
    "status": "STANDBY",
    "facilities": {
      "hasElectricity": true,
      "hasWater": true,
      "hasToilet": true,
      "hasMedicalArea": true,
      "hasGenerator": true,
      "hasInternet": false
    },
    "contactPerson": {
      "name": "John Doe",
      "phone": "+63912345678",
      "position": "Evacuation Center Manager"
    },
    "lastStatusUpdate": null,
    "notes": "Recently renovated",
    "isActive": true,
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "error": "Missing required fields: name, cityId, location, capacity, facilities",
  "code": "VALIDATION_ERROR"
}
```

---

## 5. PUT /evacuation-centers/:id
**Update an evacuation center**

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Evacuation center MongoDB ID |

### Request Body (application/json)
```json
{
  "name": "Updated School Gym",
  "address": "New Address, Bulacan",
  "landmark": "Updated landmark",
  "capacity": {
    "maxIndividuals": 600,
    "maxFamilies": 120,
    "currentIndividuals": 245,
    "currentFamilies": 45
  },
  "facilities": {
    "hasElectricity": true,
    "hasWater": true,
    "hasToilet": true,
    "hasMedicalArea": true,
    "hasGenerator": true,
    "hasInternet": true
  },
  "contactPerson": {
    "name": "Jane Smith",
    "phone": "+63987654321",
    "position": "Site Manager"
  },
  "notes": "Updated facility",
  "isActive": true
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "cityId": "city-001",
    "name": "Updated School Gym",
    "location": {
      "lat": 14.8505,
      "lng": 121.1245
    },
    "address": "New Address, Bulacan",
    "landmark": "Updated landmark",
    "capacity": {
      "maxIndividuals": 600,
      "maxFamilies": 120,
      "currentIndividuals": 245,
      "currentFamilies": 45
    },
    "status": "OPEN",
    "facilities": {
      "hasElectricity": true,
      "hasWater": true,
      "hasToilet": true,
      "hasMedicalArea": true,
      "hasGenerator": true,
      "hasInternet": true
    },
    "contactPerson": {
      "name": "Jane Smith",
      "phone": "+63987654321",
      "position": "Site Manager"
    },
    "lastStatusUpdate": "2024-01-15T10:30:00.000Z",
    "notes": "Updated facility",
    "isActive": true,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "error": "Evacuation center not found",
  "code": "NOT_FOUND"
}
```

---

## 6. DELETE /evacuation-centers/:id
**Delete an evacuation center**

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Evacuation center MongoDB ID |

### Request Example
```http
DELETE /api/admin/evacuation-centers/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Evacuation center deleted successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "cityId": "city-001",
    "name": "Calumpit Central School Gym",
    "location": {
      "lat": 14.8505,
      "lng": 121.1245
    },
    "address": "Calumpit, Bulacan",
    "landmark": "Near the Municipal Hall",
    "capacity": {
      "maxIndividuals": 500,
      "maxFamilies": 100,
      "currentIndividuals": 245,
      "currentFamilies": 45
    },
    "status": "OPEN",
    "facilities": {
      "hasElectricity": true,
      "hasWater": true,
      "hasToilet": true,
      "hasMedicalArea": true,
      "hasGenerator": true,
      "hasInternet": false
    },
    "contactPerson": {
      "name": "John Doe",
      "phone": "+63912345678",
      "position": "Evacuation Center Manager"
    },
    "lastStatusUpdate": "2024-01-15T10:30:00.000Z",
    "notes": "Fully operational",
    "isActive": true,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "error": "Evacuation center not found",
  "code": "NOT_FOUND"
}
```

---

## 7. PATCH /evacuation-centers/:id/status
**Update the status of an evacuation center**

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Evacuation center MongoDB ID |

### Request Body (application/json)
```json
{
  "status": "FULL"
}
```

### Valid Status Values
- `OPEN` - Center is accepting evacuees
- `FULL` - Center is at maximum capacity
- `CLOSED` - Center is closed
- `STANDBY` - Center is on standby

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "cityId": "city-001",
    "name": "Calumpit Central School Gym",
    "location": {
      "lat": 14.8505,
      "lng": 121.1245
    },
    "address": "Calumpit, Bulacan",
    "landmark": "Near the Municipal Hall",
    "capacity": {
      "maxIndividuals": 500,
      "maxFamilies": 100,
      "currentIndividuals": 500,
      "currentFamilies": 100
    },
    "status": "FULL",
    "facilities": {
      "hasElectricity": true,
      "hasWater": true,
      "hasToilet": true,
      "hasMedicalArea": true,
      "hasGenerator": true,
      "hasInternet": false
    },
    "contactPerson": {
      "name": "John Doe",
      "phone": "+63912345678",
      "position": "Evacuation Center Manager"
    },
    "lastStatusUpdate": "2024-01-15T15:45:00.000Z",
    "notes": "Fully operational",
    "isActive": true,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T15:45:00.000Z"
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "error": "Status is required",
  "code": "VALIDATION_ERROR"
}
```

### Error Response (404)
```json
{
  "success": false,
  "error": "Evacuation center not found",
  "code": "NOT_FOUND"
}
```

---

## 8. PATCH /evacuation-centers/:id/capacity
**Update the capacity of an evacuation center**

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Evacuation center MongoDB ID |

### Request Body (application/json)
```json
{
  "capacity": {
    "maxIndividuals": 600,
    "maxFamilies": 120,
    "currentIndividuals": 450,
    "currentFamilies": 80
  }
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "cityId": "city-001",
    "name": "Calumpit Central School Gym",
    "location": {
      "lat": 14.8505,
      "lng": 121.1245
    },
    "address": "Calumpit, Bulacan",
    "landmark": "Near the Municipal Hall",
    "capacity": {
      "maxIndividuals": 600,
      "maxFamilies": 120,
      "currentIndividuals": 450,
      "currentFamilies": 80
    },
    "status": "OPEN",
    "facilities": {
      "hasElectricity": true,
      "hasWater": true,
      "hasToilet": true,
      "hasMedicalArea": true,
      "hasGenerator": true,
      "hasInternet": false
    },
    "contactPerson": {
      "name": "John Doe",
      "phone": "+63912345678",
      "position": "Evacuation Center Manager"
    },
    "lastStatusUpdate": "2024-01-15T10:30:00.000Z",
    "notes": "Fully operational",
    "isActive": true,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T16:00:00.000Z"
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "error": "Capacity is required",
  "code": "VALIDATION_ERROR"
}
```

### Error Response (404)
```json
{
  "success": false,
  "error": "Evacuation center not found",
  "code": "NOT_FOUND"
}
```

---

## 9. GET /evacuation-centers/:id/capacity
**Get available capacity information for an evacuation center**

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Evacuation center MongoDB ID |

### Request Example
```http
GET /api/admin/evacuation-centers/65a1b2c3d4e5f6g7h8i9j0k1/capacity
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "available": 255,
  "percentage": 49
}
```

Description:
- `available` - Number of available individual slots
- `percentage` - Occupancy percentage (rounded)

### Error Response (404)
```json
{
  "success": false,
  "available": 0,
  "percentage": 0,
  "error": "Evacuation center not found"
}
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource successfully created |
| 400 | Bad Request - Invalid request body or parameters |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error occurred |

---

## Common Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { /* resource object or array */ },
  "count": 1 // only for list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}
```

---

## Authorization

All endpoints require:

### Headers
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Required Roles
- `APP_ADMIN` - Full access to all evacuation center operations
- `CITY_ADMIN` - Access to evacuation center operations for assigned city

---

## Data Types and Constraints

### Location
```typescript
{
  lat: number    // -90 to 90
  lng: number    // -180 to 180
}
```

### Capacity
```typescript
{
  maxIndividuals: number       // Required, > 0
  maxFamilies?: number         // Optional, > 0
  currentIndividuals: number   // Required, >= 0, <= maxIndividuals
  currentFamilies?: number     // Optional, >= 0, <= maxFamilies
}
```

### Facilities
```typescript
{
  hasElectricity: boolean   // Required
  hasWater: boolean         // Required
  hasToilet: boolean        // Required
  hasMedicalArea?: boolean  // Optional
  hasGenerator?: boolean    // Optional
  hasInternet?: boolean     // Optional
}
```

### Contact Person
```typescript
{
  name: string       // Required
  phone: string      // Required
  position?: string  // Optional
}
```

### Status Values
```typescript
type Status = 'OPEN' | 'FULL' | 'CLOSED' | 'STANDBY'
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTH_ERROR` | Authentication/authorization failed |
| `NOT_FOUND` | Resource not found |
| `SERVICE_ERROR` | Internal service error |
| `DATABASE_ERROR` | Database operation failed |

---

## Examples

### Example 1: Create an evacuation center with all fields
```bash
curl -X POST http://localhost:3001/api/admin/evacuation-centers \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "cityId": "city-001",
    "name": "Calumpit Central School Gym",
    "location": {
      "lat": 14.8505,
      "lng": 121.1245
    },
    "address": "Calumpit, Bulacan",
    "landmark": "Near the Municipal Hall",
    "capacity": {
      "maxIndividuals": 500,
      "maxFamilies": 100,
      "currentIndividuals": 0,
      "currentFamilies": 0
    },
    "status": "STANDBY",
    "facilities": {
      "hasElectricity": true,
      "hasWater": true,
      "hasToilet": true,
      "hasMedicalArea": true,
      "hasGenerator": true,
      "hasInternet": false
    },
    "contactPerson": {
      "name": "John Doe",
      "phone": "+63912345678",
      "position": "Evacuation Center Manager"
    },
    "notes": "Recently renovated"
  }'
```

### Example 2: Get evacuation centers by city
```bash
curl -X GET "http://localhost:3001/api/admin/evacuation-centers?cityId=city-001" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Example 3: Get open evacuation centers in a city
```bash
curl -X GET "http://localhost:3001/api/admin/evacuation-centers?cityId=city-001&status=OPEN" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Example 4: Get fully occupied evacuation centers
```bash
curl -X GET "http://localhost:3001/api/admin/evacuation-centers?status=FULL" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Example 5: Get standby centers in a city
```bash
curl -X GET "http://localhost:3001/api/admin/evacuation-centers?cityId=city-001&status=STANDBY" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Example 6: Update evacuation center status
```bash
curl -X PATCH http://localhost:3001/api/admin/evacuation-centers/65a1b2c3d4e5f6g7h8i9j0k1/status \
  -H "Author7zation: Bearer eyJhbGc..." \
  -H "Conten7-Type: application/json" \
  -d '{
    "status": "FULL"
  }'
```

### Example 3: Update capacity
```bash
curl -X PATCH http://localhost:3001/api/admin/evacuation-centers/65a1b2c3d4e5f6g7h8i9j0k1/capacity \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "capacity": {
      "maxIndividuals": 600,
      "maxFa8ilies": 120,
      "currentIndividuals": 450,
      "currentFamilies": 80
    }
  }'
```

### Example 4: Get available capacity
```bash
curl -X GET http://localhost:3001/api/admin/evacuation-centers/65a1b2c3d4e5f6g7h8i9j0k1/capacity \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "available": 150,
  "percentage": 75
}
```
