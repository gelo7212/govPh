# Evacuation Center API Specifications

## Base URL
```
/api/evacuation-centers
```

---

## 1. GET /evacuation-centers
**Get all evacuation centers with optional filtering**

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cityId` | string | No | Filter by city ID |
| `status` | string | No | Filter by status (OPEN, FULL, CLOSED, STANDBY) |
| `isActive` | boolean | No | Filter by active status (true/false) |

### Request Example
```http
GET /api/evacuation-centers?cityId=city-001&status=OPEN&isActive=true
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

### Error Response (500)
```json
{
  "success": false,
  "error": "Database connection failed"
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
GET /api/evacuation-centers/65a1b2c3d4e5f6g7h8i9j0k1
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
  "error": "Evacuation center not found"
}
```

---

## 3. GET /cities/:cityId/evacuation-centers
**Get all evacuation centers for a specific city**

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cityId` | string | Yes | City ID |

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (OPEN, FULL, CLOSED, STANDBY) |
| `isActive` | boolean | No | Filter by active status (true/false) |

### Request Example
```http
GET /api/cities/city-001/evacuation-centers?status=OPEN&isActive=true
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

### Error Response (500)
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

---

## 4. POST /evacuation-centers
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
  "error": "Missing required fields: name, cityId, location, capacity, facilities"
}
```

### Error Response (500)
```json
{
  "success": false,
  "error": "Validation error: location.lat must be between -90 and 90"
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
  "error": "Evacuation center not found"
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
DELETE /api/evacuation-centers/65a1b2c3d4e5f6g7h8i9j0k1
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
  "error": "Evacuation center not found"
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
  "error": "Invalid status. Must be one of: OPEN, FULL, CLOSED, STANDBY"
}
```

### Error Response (404)
```json
{
  "success": false,
  "error": "Evacuation center not found"
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
  "error": "Missing required field: capacity"
}
```

### Error Response (404)
```json
{
  "success": false,
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
  "error": "Error message describing what went wrong"
}
```

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
