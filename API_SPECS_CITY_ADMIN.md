# City Management API - BFF Admin

## Base URL
```
http://localhost:3001/api/admin/cities
```

## Authentication
All endpoints require:
- **Header**: `Authorization: Bearer <JWT_TOKEN>`

---

## Cities Endpoints

### GET /
List all cities with optional filtering

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
- `provinceCode` (string, optional): Filter by province code

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "cityCode": "CALUMPIT",
      "cityId": "507f1f77bcf86cd799439011",
      "name": "Calumpit",
      "provinceCode": "BULACAN",
      "centerLocation": {
        "lat": 14.82,
        "lng": 120.78
      },
      "isActive": true,
      "createdAt": "2026-01-04T00:00:00Z",
      "updatedAt": "2026-01-04T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### GET /:cityCode
Get city by city code

**Path Parameters:**
- `cityCode` (string, required): City code (e.g., "CALUMPIT")

**Response:**
```json
{
  "success": true,
  "data": {
    "cityCode": "CALUMPIT",
    "cityId": "507f1f77bcf86cd799439011",
    "name": "Calumpit",
    "provinceCode": "BULACAN",
    "centerLocation": {
      "lat": 14.82,
      "lng": 120.78
    },
    "isActive": true,
    "createdAt": "2026-01-04T00:00:00Z",
    "updatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

### POST /
Create a new city

**Required Role:** `APP_ADMIN`

**Request Body:**
```json
{
  "cityCode": "CALUMPIT",
  "cityId": "507f1f77bcf86cd799439011",
  "name": "Calumpit",
  "provinceCode": "BULACAN",
  "centerLocation": {
    "lat": 14.82,
    "lng": 120.78
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "cityCode": "CALUMPIT",
    "cityId": "507f1f77bcf86cd799439011",
    "name": "Calumpit",
    "provinceCode": "BULACAN",
    "centerLocation": {
      "lat": 14.82,
      "lng": 120.78
    },
    "isActive": true,
    "createdAt": "2026-01-04T00:00:00Z",
    "updatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

### PUT /:cityCode
Update city information

**Path Parameters:**
- `cityCode` (string, required): City code to update

**Request Body:**
```json
{
  "name": "Calumpit (Updated)",
  "centerLocation": {
    "lat": 14.82,
    "lng": 120.78
  },
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cityCode": "CALUMPIT",
    "cityId": "507f1f77bcf86cd799439011",
    "name": "Calumpit (Updated)",
    "provinceCode": "BULACAN",
    "centerLocation": {
      "lat": 14.82,
      "lng": 120.78
    },
    "isActive": true,
    "createdAt": "2026-01-04T00:00:00Z",
    "updatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

### DELETE /:cityCode
Delete a city

**Required Role:** `APP_ADMIN`

**Path Parameters:**
- `cityCode` (string, required): City code to delete

**Response:**
```json
{
  "success": true,
  "message": "City deleted successfully"
}
```

---

## Departments Endpoints

### GET /:cityCode/departments
Get departments for a city

**Path Parameters:**
- `cityCode` (string, required): City code

**Query Parameters:**
- `sosCapable` (boolean, optional): Filter by SOS capable status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "cityCode": "CALUMPIT",
      "cityId": "507f1f77bcf86cd799439011",
      "code": "DEPT001",
      "name": "Police Department",
      "handlesIncidentTypes": ["theft", "assault"],
      "sosCapable": true,
      "isActive": true,
      "createdAt": "2026-01-04T00:00:00Z",
      "updatedAt": "2026-01-04T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### POST /:cityCode/departments
Create a department for a city

**Path Parameters:**
- `cityCode` (string, required): City code

**Request Body:**
```json
{
  "cityCode": "CALUMPIT",
  "cityId": "507f1f77bcf86cd799439011",
  "code": "DEPT001",
  "name": "Police Department",
  "handlesIncidentTypes": ["theft", "assault"],
  "sosCapable": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "cityCode": "CALUMPIT",
    "cityId": "507f1f77bcf86cd799439011",
    "code": "DEPT001",
    "name": "Police Department",
    "handlesIncidentTypes": ["theft", "assault"],
    "sosCapable": true,
    "isActive": true,
    "createdAt": "2026-01-04T00:00:00Z",
    "updatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

### PUT /departments/:id
Update a department

**Path Parameters:**
- `id` (string, required): Department ID

**Request Body:**
```json
{
  "name": "Police Department (Updated)",
  "handlesIncidentTypes": ["theft", "assault", "robbery"],
  "sosCapable": true,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "cityCode": "CALUMPIT",
    "cityId": "507f1f77bcf86cd799439011",
    "code": "DEPT001",
    "name": "Police Department (Updated)",
    "handlesIncidentTypes": ["theft", "assault", "robbery"],
    "sosCapable": true,
    "isActive": true,
    "createdAt": "2026-01-04T00:00:00Z",
    "updatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

### DELETE /departments/:id
Delete a department

**Path Parameters:**
- `id` (string, required): Department ID

**Response:**
```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

---

## SOS HQ Endpoints

### GET /:cityCode/sos-hq
Get SOS HQ for a city

**Path Parameters:**
- `cityCode` (string, required): City code

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "scopeLevel": "CITY",
      "cityCode": "CALUMPIT",
      "cityId": "507f1f77bcf86cd799439011",
      "name": "Main SOS HQ Calumpit",
      "location": {
        "lat": 14.82,
        "lng": 120.78
      },
      "coverageRadiusKm": 15,
      "supportedDepartmentCodes": ["DEPT001", "DEPT002"],
      "isMain": true,
      "isTemporary": false,
      "isActive": true,
      "activatedAt": "2026-01-04T00:00:00Z",
      "createdAt": "2026-01-04T00:00:00Z",
      "updatedAt": "2026-01-04T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### POST /:cityCode/sos-hq
Create SOS HQ for a city

**Path Parameters:**
- `cityCode` (string, required): City code

**Request Body:**
```json
{
  "scopeLevel": "CITY",
  "cityCode": "CALUMPIT",
  "cityId": "507f1f77bcf86cd799439011",
  "name": "Main SOS HQ Calumpit",
  "location": {
    "lat": 14.82,
    "lng": 120.78
  },
  "coverageRadiusKm": 15,
  "supportedDepartmentCodes": ["DEPT001", "DEPT002"],
  "isMain": true,
  "isTemporary": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "scopeLevel": "CITY",
    "cityCode": "CALUMPIT",
    "cityId": "507f1f77bcf86cd799439011",
    "name": "Main SOS HQ Calumpit",
    "location": {
      "lat": 14.82,
      "lng": 120.78
    },
    "coverageRadiusKm": 15,
    "supportedDepartmentCodes": ["DEPT001", "DEPT002"],
    "isMain": true,
    "isTemporary": false,
    "isActive": true,
    "activatedAt": "2026-01-04T00:00:00Z",
    "createdAt": "2026-01-04T00:00:00Z",
    "updatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

### PUT /sos-hq/:id
Update SOS HQ

**Path Parameters:**
- `id` (string, required): SOS HQ ID

**Request Body:**
```json
{
  "name": "Main SOS HQ Calumpit (Updated)",
  "location": {
    "lat": 14.82,
    "lng": 120.78
  },
  "coverageRadiusKm": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "scopeLevel": "CITY",
    "cityCode": "CALUMPIT",
    "cityId": "507f1f77bcf86cd799439011",
    "name": "Main SOS HQ Calumpit (Updated)",
    "location": {
      "lat": 14.82,
      "lng": 120.78
    },
    "coverageRadiusKm": 20,
    "supportedDepartmentCodes": ["DEPT001", "DEPT002"],
    "isMain": true,
    "isTemporary": false,
    "isActive": true,
    "activatedAt": "2026-01-04T00:00:00Z",
    "createdAt": "2026-01-04T00:00:00Z",
    "updatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

### DELETE /sos-hq/:id
Delete SOS HQ

**Path Parameters:**
- `id` (string, required): SOS HQ ID

**Response:**
```json
{
  "success": true,
  "message": "SOS HQ deleted successfully"
}
```

---

### PATCH /sos-hq/:id/activate
Activate SOS HQ

**Path Parameters:**
- `id` (string, required): SOS HQ ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "isActive": true,
    "activatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

### PATCH /sos-hq/:id/deactivate
Deactivate SOS HQ

**Path Parameters:**
- `id` (string, required): SOS HQ ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "isActive": false,
    "deactivatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

## City Configuration Endpoints

### GET /:cityCode/config
Get city configuration

**Path Parameters:**
- `cityCode` (string, required): City code

**Response:**
```json
{
  "success": true,
  "data": {
    "cityCode": "CALUMPIT",
    "cityId": "507f1f77bcf86cd799439011",
    "incident": {
      "allowAnonymous": true,
      "allowOutsideCityReports": false,
      "autoAssignDepartment": true,
      "requireCityVerificationForResolve": true
    },
    "sos": {
      "allowAnywhere": true,
      "autoAssignNearestHQ": true,
      "escalationMinutes": 10,
      "allowProvinceFallback": true
    },
    "visibility": {
      "showIncidentsOnPublicMap": true,
      "showResolvedIncidents": true
    },
    "setup": {
      "isInitialized": true,
      "currentStep": "COMPLETED",
      "completedSteps": ["CITY_PROFILE", "DEPARTMENTS", "SOS_HQ", "SETTINGS"],
      "initializedAt": "2026-01-04T00:00:00Z",
      "initializedByUserId": "user123"
    },
    "isActive": true,
    "updatedByUserId": "admin123",
    "createdAt": "2026-01-04T00:00:00Z",
    "updatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

### PUT /:cityCode/config
Update city configuration

**Path Parameters:**
- `cityCode` (string, required): City code

**Request Body:**
```json
{
  "incident": {
    "allowAnonymous": true,
    "allowOutsideCityReports": false,
    "autoAssignDepartment": true,
    "requireCityVerificationForResolve": true
  },
  "sos": {
    "allowAnywhere": true,
    "autoAssignNearestHQ": true,
    "escalationMinutes": 15,
    "allowProvinceFallback": true
  },
  "visibility": {
    "showIncidentsOnPublicMap": true,
    "showResolvedIncidents": true
  },
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cityCode": "CALUMPIT",
    "cityId": "507f1f77bcf86cd799439011",
    "incident": {...},
    "sos": {...},
    "visibility": {...},
    "setup": {...},
    "isActive": true,
    "updatedByUserId": "admin123",
    "createdAt": "2026-01-04T00:00:00Z",
    "updatedAt": "2026-01-04T00:00:00Z"
  }
}
```

---

### PATCH /:cityCode/config/incident-rules
Update incident rules

**Path Parameters:**
- `cityCode` (string, required): City code

**Request Body:**
```json
{
  "allowAnonymous": false,
  "allowOutsideCityReports": true,
  "autoAssignDepartment": true,
  "requireCityVerificationForResolve": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "incident": {
      "allowAnonymous": false,
      "allowOutsideCityReports": true,
      "autoAssignDepartment": true,
      "requireCityVerificationForResolve": true
    }
  }
}
```

---

### PATCH /:cityCode/config/sos-rules
Update SOS rules

**Path Parameters:**
- `cityCode` (string, required): City code

**Request Body:**
```json
{
  "allowAnywhere": true,
  "autoAssignNearestHQ": false,
  "escalationMinutes": 20,
  "allowProvinceFallback": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sos": {
      "allowAnywhere": true,
      "autoAssignNearestHQ": false,
      "escalationMinutes": 20,
      "allowProvinceFallback": false
    }
  }
}
```

---

### PATCH /:cityCode/config/visibility-rules
Update visibility rules

**Path Parameters:**
- `cityCode` (string, required): City code

**Request Body:**
```json
{
  "showIncidentsOnPublicMap": false,
  "showResolvedIncidents": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "visibility": {
      "showIncidentsOnPublicMap": false,
      "showResolvedIncidents": false
    }
  }
}
```

---

## Setup Workflow Endpoints

### POST /:cityCode/setup/initialize
Initialize city setup workflow

**Path Parameters:**
- `cityCode` (string, required): City code

**Request Body:**
```json
{
  "userId": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "setup": {
      "isInitialized": true,
      "currentStep": "CITY_PROFILE",
      "completedSteps": ["CITY_PROFILE"],
      "initializedAt": "2026-01-04T00:00:00Z",
      "initializedByUserId": "admin123"
    }
  },
  "message": "Setup initialized successfully"
}
```

---

### PATCH /:cityCode/setup/step
Update setup step

**Path Parameters:**
- `cityCode` (string, required): City code

**Request Body:**
```json
{
  "step": "DEPARTMENTS"
}
```

**Valid Steps:**
- `CITY_PROFILE`
- `DEPARTMENTS`
- `SOS_HQ`
- `SETTINGS`
- `COMPLETED`

**Response:**
```json
{
  "success": true,
  "data": {
    "setup": {
      "isInitialized": true,
      "currentStep": "DEPARTMENTS",
      "completedSteps": ["CITY_PROFILE", "DEPARTMENTS"],
      "initializedAt": "2026-01-04T00:00:00Z",
      "initializedByUserId": "admin123"
    }
  },
  "message": "Setup step updated to DEPARTMENTS"
}
```

---

### GET /:cityCode/setup/status
Get setup status

**Path Parameters:**
- `cityCode` (string, required): City code

**Response:**
```json
{
  "success": true,
  "data": {
    "isInitialized": true,
    "currentStep": "DEPARTMENTS",
    "completedSteps": ["CITY_PROFILE", "DEPARTMENTS"],
    "initializedAt": "2026-01-04T00:00:00Z",
    "initializedByUserId": "admin123"
  }
}
```

---

## Composite Operations

### GET /:cityCode/complete-setup
Get complete city setup (city + config + departments + sos-hq)

**Path Parameters:**
- `cityCode` (string, required): City code

**Response:**
```json
{
  "success": true,
  "data": {
    "city": {
      "cityCode": "CALUMPIT",
      "cityId": "507f1f77bcf86cd799439011",
      "name": "Calumpit",
      "provinceCode": "BULACAN",
      "centerLocation": {
        "lat": 14.82,
        "lng": 120.78
      },
      "isActive": true,
      "createdAt": "2026-01-04T00:00:00Z",
      "updatedAt": "2026-01-04T00:00:00Z"
    },
    "config": {
      "cityCode": "CALUMPIT",
      "cityId": "507f1f77bcf86cd799439011",
      "incident": {...},
      "sos": {...},
      "visibility": {...},
      "setup": {...},
      "isActive": true,
      "createdAt": "2026-01-04T00:00:00Z",
      "updatedAt": "2026-01-04T00:00:00Z"
    },
    "departments": [...],
    "sosHQ": [...]
  }
}
```

---

## Error Responses

All endpoints return error responses in this format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "INVALID_REQUEST",
  "message": "Invalid request parameters"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "User not authenticated"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "This endpoint requires one of the following roles: APP_ADMIN"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "City not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "City code already exists"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "Failed to fetch cities"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful GET, PUT, PATCH |
| 201 | Created - Successful POST |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Role Requirements

| Endpoint | Required Role |
|----------|---------------|
| GET / | APP_ADMIN, CITY_ADMIN |
| GET /:cityCode | APP_ADMIN, CITY_ADMIN |
| POST / | APP_ADMIN |
| PUT /:cityCode | APP_ADMIN, CITY_ADMIN |
| DELETE /:cityCode | APP_ADMIN |
| GET /:cityCode/departments | APP_ADMIN, CITY_ADMIN |
| POST /:cityCode/departments | APP_ADMIN, CITY_ADMIN |
| PUT /departments/:id | APP_ADMIN, CITY_ADMIN |
| DELETE /departments/:id | APP_ADMIN, CITY_ADMIN |
| GET /:cityCode/sos-hq | APP_ADMIN, CITY_ADMIN |
| POST /:cityCode/sos-hq | APP_ADMIN, CITY_ADMIN |
| PUT /sos-hq/:id | APP_ADMIN, CITY_ADMIN |
| DELETE /sos-hq/:id | APP_ADMIN, CITY_ADMIN |
| PATCH /sos-hq/:id/activate | APP_ADMIN, CITY_ADMIN |
| PATCH /sos-hq/:id/deactivate | APP_ADMIN, CITY_ADMIN |
| GET /:cityCode/config | APP_ADMIN, CITY_ADMIN |
| PUT /:cityCode/config | APP_ADMIN, CITY_ADMIN |
| PATCH /:cityCode/config/incident-rules | APP_ADMIN, CITY_ADMIN |
| PATCH /:cityCode/config/sos-rules | APP_ADMIN, CITY_ADMIN |
| PATCH /:cityCode/config/visibility-rules | APP_ADMIN, CITY_ADMIN |
| POST /:cityCode/setup/initialize | APP_ADMIN, CITY_ADMIN |
| PATCH /:cityCode/setup/step | APP_ADMIN, CITY_ADMIN |
| GET /:cityCode/setup/status | APP_ADMIN, CITY_ADMIN |
| GET /:cityCode/complete-setup | APP_ADMIN, CITY_ADMIN |

