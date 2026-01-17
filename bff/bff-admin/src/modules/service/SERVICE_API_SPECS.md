# Service Module API Specifications
## BFF Admin - Service Management

### Base URL
```
/api/admin/services
```

### Authentication
All endpoints require:
- Authentication middleware (`authContextMiddleware`)
- Valid role: `APP_ADMIN` or `CITY_ADMIN`
- Cannot be accessed by `ANON` or `SHARE_LINK` actors

---

## Endpoints

### 1. Create Service
**POST** `/api/admin/services`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Body
```json
{
  "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
  "code": "MED_ASSIST",
  "title": "Medical Assistance Program",
  "shortDescription": "Emergency medical assistance for residents",
  "category": "health",
  "icon": "https://example.com/icons/medical.png",
  "infoForm": {
    "formId": "form_001",
    "version": 1
  },
  "applicationForm": {
    "formId": "form_002",
    "version": 1
  },
  "availability": {
    "startAt": "2026-01-18T00:00:00Z",
    "endAt": "2026-12-31T23:59:59Z"
  }
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
    "code": "MED_ASSIST",
    "title": "Medical Assistance Program",
    "shortDescription": "Emergency medical assistance for residents",
    "category": "health",
    "icon": "https://example.com/icons/medical.png",
    "isActive": true,
    "infoForm": {
      "formId": "form_001",
      "version": 1
    },
    "applicationForm": {
      "formId": "form_002",
      "version": 1
    },
    "availability": {
      "startAt": "2026-01-18T00:00:00.000Z",
      "endAt": "2026-12-31T23:59:59.000Z"
    },
    "createdAt": "2026-01-18T10:30:00.000Z",
    "updatedAt": "2026-01-18T10:30:00.000Z"
  },
  "message": "Service created successfully"
}
```

#### Error Response (409 Conflict - Duplicate)
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_SERVICE",
    "message": "Service with this code already exists in this city"
  }
}
```

---

### 2. Get Service by ID
**GET** `/api/admin/services/:serviceId`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
serviceId: string (MongoDB ObjectId)
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
    "code": "MED_ASSIST",
    "title": "Medical Assistance Program",
    "shortDescription": "Emergency medical assistance for residents",
    "category": "health",
    "icon": "https://example.com/icons/medical.png",
    "isActive": true,
    "infoForm": {
      "formId": "form_001",
      "version": 1
    },
    "applicationForm": {
      "formId": "form_002",
      "version": 1
    },
    "availability": {
      "startAt": "2026-01-18T00:00:00.000Z",
      "endAt": "2026-12-31T23:59:59.000Z"
    },
    "createdAt": "2026-01-18T10:30:00.000Z",
    "updatedAt": "2026-01-18T10:30:00.000Z"
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Service not found"
  }
}
```

---

### 3. Get Services by City
**GET** `/api/admin/services/city/:cityId`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
cityId: string (MongoDB ObjectId)
```

#### Query Parameters
```
isActive: boolean (optional) - Filter by active status
category: string (optional) - Filter by category
limit: number (optional, default: 50) - Results per page
skip: number (optional, default: 0) - Pagination offset
```

#### Example Query
```
GET /api/admin/services/city/672e1f8c3e4c2a1b5f8e9c0d?isActive=true&category=health&limit=20&skip=0
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
      "code": "MED_ASSIST",
      "title": "Medical Assistance Program",
      "shortDescription": "Emergency medical assistance for residents",
      "category": "health",
      "icon": "https://example.com/icons/medical.png",
      "isActive": true,
      "infoForm": {
        "formId": "form_001",
        "version": 1
      },
      "applicationForm": {
        "formId": "form_002",
        "version": 1
      },
      "availability": {
        "startAt": "2026-01-18T00:00:00.000Z",
        "endAt": "2026-12-31T23:59:59.000Z"
      },
      "createdAt": "2026-01-18T10:30:00.000Z",
      "updatedAt": "2026-01-18T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
      "code": "SCHOLAR",
      "title": "Scholarship Program",
      "shortDescription": "Educational scholarship for deserving students",
      "category": "education",
      "icon": "https://example.com/icons/scholarship.png",
      "isActive": true,
      "infoForm": {
        "formId": "form_003",
        "version": 1
      },
      "applicationForm": {
        "formId": "form_004",
        "version": 2
      },
      "availability": {
        "startAt": "2026-06-01T00:00:00.000Z",
        "endAt": "2026-08-31T23:59:59.000Z"
      },
      "createdAt": "2026-01-18T11:15:00.000Z",
      "updatedAt": "2026-01-18T11:15:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 4. Get All Services (Global)
**GET** `/api/admin/services`

**Required Roles:** `APP_ADMIN`

#### Query Parameters
```
isActive: boolean (optional)
category: string (optional)
cityId: string (optional)
limit: number (optional, default: 50)
skip: number (optional, default: 0)
```

#### Example Query
```
GET /api/admin/services?isActive=true&limit=30&skip=0
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
      "code": "MED_ASSIST",
      "title": "Medical Assistance Program",
      "shortDescription": "Emergency medical assistance for residents",
      "category": "health",
      "icon": "https://example.com/icons/medical.png",
      "isActive": true,
      "createdAt": "2026-01-18T10:30:00.000Z",
      "updatedAt": "2026-01-18T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 5. Get Services by Category
**GET** `/api/admin/services/city/:cityId/category/:category`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
cityId: string (MongoDB ObjectId)
category: string (health|education|employment|custom)
```

#### Query Parameters
```
isActive: boolean (optional)
```

#### Example Query
```
GET /api/admin/services/city/672e1f8c3e4c2a1b5f8e9c0d/category/health?isActive=true
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
      "code": "MED_ASSIST",
      "title": "Medical Assistance Program",
      "shortDescription": "Emergency medical assistance for residents",
      "category": "health",
      "isActive": true,
      "createdAt": "2026-01-18T10:30:00.000Z",
      "updatedAt": "2026-01-18T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 6. Update Service
**PUT** `/api/admin/services/:serviceId`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
serviceId: string (MongoDB ObjectId)
```

#### Request Body
```json
{
  "title": "Medical Assistance Program - Updated",
  "shortDescription": "Enhanced emergency medical assistance",
  "category": "health",
  "icon": "https://example.com/icons/medical-v2.png"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
    "code": "MED_ASSIST",
    "title": "Medical Assistance Program - Updated",
    "shortDescription": "Enhanced emergency medical assistance",
    "category": "health",
    "icon": "https://example.com/icons/medical-v2.png",
    "isActive": true,
    "createdAt": "2026-01-18T10:30:00.000Z",
    "updatedAt": "2026-01-18T14:45:00.000Z"
  },
  "message": "Service updated successfully"
}
```

---

### 7. Delete Service (Permanent)
**DELETE** `/api/admin/services/:serviceId`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
serviceId: string (MongoDB ObjectId)
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
    "code": "MED_ASSIST",
    "title": "Medical Assistance Program",
    "isActive": true
  },
  "message": "Service deleted successfully"
}
```

---

### 8. Archive Service (Soft Delete)
**PATCH** `/api/admin/services/:serviceId/archive`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
serviceId: string (MongoDB ObjectId)
```

#### Request Body
```json
{}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
    "code": "MED_ASSIST",
    "title": "Medical Assistance Program",
    "isActive": false,
    "updatedAt": "2026-01-18T15:00:00.000Z"
  },
  "message": "Service archived successfully"
}
```

---

### 9. Activate Service
**PATCH** `/api/admin/services/:serviceId/activate`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
serviceId: string (MongoDB ObjectId)
```

#### Request Body
```json
{}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
    "code": "MED_ASSIST",
    "title": "Medical Assistance Program",
    "isActive": true,
    "updatedAt": "2026-01-18T15:30:00.000Z"
  },
  "message": "Service activated successfully"
}
```

---

### 10. Update Info Form
**PATCH** `/api/admin/services/:serviceId/info-form`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
serviceId: string (MongoDB ObjectId)
```

#### Request Body
```json
{
  "formId": "form_001_updated",
  "version": 2
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
    "code": "MED_ASSIST",
    "title": "Medical Assistance Program",
    "infoForm": {
      "formId": "form_001_updated",
      "version": 2
    },
    "updatedAt": "2026-01-18T16:00:00.000Z"
  },
  "message": "Info form updated successfully"
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "formId is required"
  }
}
```

---

### 11. Update Application Form
**PATCH** `/api/admin/services/:serviceId/application-form`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
serviceId: string (MongoDB ObjectId)
```

#### Request Body
```json
{
  "formId": "form_002_v3",
  "version": 3
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
    "code": "MED_ASSIST",
    "title": "Medical Assistance Program",
    "applicationForm": {
      "formId": "form_002_v3",
      "version": 3
    },
    "updatedAt": "2026-01-18T16:15:00.000Z"
  },
  "message": "Application form updated successfully"
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "formId is required"
  }
}
```

---

### 12. Update Availability
**PATCH** `/api/admin/services/:serviceId/availability`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
serviceId: string (MongoDB ObjectId)
```

#### Request Body
```json
{
  "startAt": "2026-02-01T00:00:00Z",
  "endAt": "2026-03-31T23:59:59Z"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cityId": "672e1f8c3e4c2a1b5f8e9c0d",
    "code": "MED_ASSIST",
    "title": "Medical Assistance Program",
    "availability": {
      "startAt": "2026-02-01T00:00:00.000Z",
      "endAt": "2026-03-31T23:59:59.000Z"
    },
    "updatedAt": "2026-01-18T16:30:00.000Z"
  },
  "message": "Availability updated successfully"
}
```

---

### 13. Get Service Count by City
**GET** `/api/admin/services/city/:cityId/count`

**Required Roles:** `APP_ADMIN`, `CITY_ADMIN`

#### Request Parameters
```
cityId: string (MongoDB ObjectId)
```

#### Query Parameters
```
isActive: boolean (optional)
```

#### Example Query
```
GET /api/admin/services/city/672e1f8c3e4c2a1b5f8e9c0d/count?isActive=true
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": 5,
  "message": "Total active services in city"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOT_FOUND` | 404 | Service not found |
| `INVALID_REQUEST` | 400 | Missing required fields |
| `DUPLICATE_SERVICE` | 409 | Service code already exists in city |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Sample Service Categories
- `health` - Health and medical services
- `education` - Education and scholarship programs
- `employment` - Job and employment assistance
- Custom categories supported

---

## Notes

1. All timestamps are in ISO 8601 format
2. `isActive` field indicates if service is archived (false) or active (true)
3. Forms are optional - a service can have:
   - Both info and application forms
   - Only info form (informational only)
   - Only application form (application only)
   - No forms (manual process)
4. Availability dates are optional - service can be available year-round
5. All list endpoints support pagination via `limit` and `skip` parameters
6. Archive vs Delete:
   - Archive: Soft delete, sets `isActive` to false, recoverable
   - Delete: Hard delete, permanent removal
