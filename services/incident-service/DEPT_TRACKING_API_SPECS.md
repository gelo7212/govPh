# Department Tracking API Specifications

## Overview

The Department Tracking API enables the creation, validation, and management of shareable links for incident reports. These links can be scoped to specific assignments or entire department assignments, allowing city admins and departments to share incident tracking access with other users.

**Base URL:** `/dept-tracking` (local development)
**Service:** Incident Service
**Authentication:** Bearer Token (JWT)

---

## API Endpoints

### 1. Create Shareable Link

**Create a shareable link for department/assignment tracking**

```http
POST /dept-tracking/create
```

#### Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "cityId": "string (required)",
  "departmentId": "string (required)",
  "scope": "ASSIGNMENT_ONLY | DEPT_ACTIVE (required)",
  "assignmentId": "string (required for ASSIGNMENT_ONLY scope)",
  "incidentId": "string (required)",
  "createdBy": "string (required, user ID)"
}
```

#### Response

**Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-01-09T10:30:00Z"
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | INTERNAL_ERROR",
    "message": "Error description"
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

#### Scope Types

| Scope | Description | Requires `assignmentId` |
|-------|-------------|----------------------|
| `ASSIGNMENT_ONLY` | Shareable link for a specific assignment report | Yes |
| `DEPT_ACTIVE` | Shareable link for all active department assignments | No |

#### Usage Example

**For specific assignment:**
```bash
curl -X POST http://localhost:3001/dept-tracking/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "cityId": "manila",
    "departmentId": "fire-dept-001",
    "scope": "ASSIGNMENT_ONLY",
    "assignmentId": "assign-123",
    "incidentId": "incident-456",
    "createdBy": "user-789"
  }'
```

**For department assignments:**
```bash
curl -X POST http://localhost:3001/dept-tracking/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "cityId": "manila",
    "departmentId": "fire-dept-001",
    "scope": "DEPT_ACTIVE",
    "incidentId": "incident-456",
    "createdBy": "user-789"
  }'
```

---

### 2. Validate Shareable Link

**Validate a shareable link and retrieve its metadata**

```http
GET /dept-tracking/validate/:hashToken
```

#### Request

**Path Parameters:**
- `hashToken` (string, required): The hash token from the shareable link

**Headers:**
```
Content-Type: application/json
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "cityId": "manila",
    "departmentId": "fire-dept-001",
    "scope": "ASSIGNMENT_ONLY",
    "assignmentId": "assign-123",
    "expiresAt": "2026-01-09T10:30:00Z"
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

**Invalid or Expired (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_OR_EXPIRED_TOKEN",
    "message": "Shareable link is invalid or expired"
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

#### Usage Example

```bash
curl -X GET http://localhost:3001/dept-tracking/validate/abc123def456xyz \
  -H "Content-Type: application/json"
```

---

### 3. Revoke Shareable Link

**Revoke a shareable link to disable access**

```http
DELETE /dept-tracking/revoke/:hashToken
```

#### Request

**Path Parameters:**
- `hashToken` (string, required): The hash token to revoke

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Shareable link revoked successfully"
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

**Error (400/404/500):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND | INTERNAL_ERROR",
    "message": "Error description"
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

#### Usage Example

```bash
curl -X DELETE http://localhost:3001/dept-tracking/revoke/abc123def456xyz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

---

### 4. Get Active Links by Department

**Retrieve all active shareable links for a department**

```http
GET /dept-tracking/department/:departmentId
```

#### Request

**Path Parameters:**
- `departmentId` (string, required): The department ID

**Query Parameters:**
- None

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "scope": "ASSIGNMENT_ONLY",
      "assignmentId": "assign-123",
      "expiresAt": "2026-01-09T10:30:00Z"
    },
    {
      "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "scope": "DEPT_ACTIVE",
      "assignmentId": null,
      "expiresAt": "2026-01-10T10:30:00Z"
    }
  ],
  "timestamp": "2026-01-08T10:30:00Z"
}
```

**Empty Result (200 OK):**
```json
{
  "success": true,
  "data": [],
  "timestamp": "2026-01-08T10:30:00Z"
}
```

#### Usage Example

```bash
curl -X GET http://localhost:3001/dept-tracking/department/fire-dept-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

---

## Data Models

### DeptTrackingToken

```typescript
interface IDeptTrackingToken {
  _id?: ObjectId;
  jwt: string;
  cityId: string;
  departmentId: string;
  scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE';
  assignmentId?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdBy: string;
  createdAt: Date;
}
```

### API Response Model

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: Date;
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `INVALID_OR_EXPIRED_TOKEN` | 404 | Token is invalid or has expired |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication token is missing or invalid |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Authentication & Authorization

### Required Roles

| Endpoint | Role Required | Description |
|----------|--------------|-------------|
| `POST /create` | CITY_ADMIN, SOS_ADMIN | Create shareable links |
| `GET /validate/:hashToken` | Public | Validate tokens without auth |
| `DELETE /revoke/:hashToken` | CITY_ADMIN, SOS_ADMIN | Revoke own department links |
| `GET /department/:departmentId` | CITY_ADMIN, SOS_ADMIN | View department links |

### Token Claims

JWT tokens generated include:
- `contextType`: "SHARE_LINK"
- `contextUsage`: "REPORT_ASSIGNMENT" or "REPORT_ASSIGNMENT_DEPARTMENT"
- `identity.incidentId`: The incident ID
- `identity.cityId`: The city ID
- `actor.departmentId`: The department ID
- `actor.assignmentId`: The assignment ID (if ASSIGNMENT_ONLY scope)

---

## Frontend Integration Guide

### React Hook Example

```typescript
// Create shareable link
const createShareableLink = async (
  cityId: string,
  departmentId: string,
  incidentId: string,
  scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE',
  assignmentId?: string
) => {
  const response = await fetch('/api/dept-tracking/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      cityId,
      departmentId,
      incidentId,
      scope,
      assignmentId,
      createdBy: userId
    })
  });
  
  const data = await response.json();
  return data.data.jwt; // JWT token to share
};

// Validate shareable link
const validateShareableLink = async (hashToken: string) => {
  const response = await fetch(
    `/api/dept-tracking/validate/${hashToken}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  if (data.success) {
    return data.data;
  }
  throw new Error('Invalid or expired link');
};

// Revoke shareable link
const revokeShareableLink = async (hashToken: string) => {
  const response = await fetch(
    `/api/dept-tracking/revoke/${hashToken}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.json();
};

// Get all active links
const getActiveDeptLinks = async (departmentId: string) => {
  const response = await fetch(
    `/api/dept-tracking/department/${departmentId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  return data.data;
};
```

---

## BFF (Backend for Frontend) Integration

### BFF Wrapper Endpoints

The BFF should expose these endpoints to the frontend:

```typescript
// BFF Route: POST /api/incidents/:incidentId/share-link
// Delegates to incident-service /dept-tracking/create
router.post('/api/incidents/:incidentId/share-link', async (req, res) => {
  const { scope, assignmentId } = req.body;
  const { incidentId } = req.params;
  const { cityId, departmentId, userId } = req.user;
  
  const response = await incidentServiceClient.post(
    '/dept-tracking/create',
    {
      cityId,
      departmentId,
      incidentId,
      scope,
      assignmentId,
      createdBy: userId
    }
  );
  
  res.json(response.data);
});

// BFF Route: GET /api/incidents/share-link/:hashToken/validate
// Delegates to incident-service /dept-tracking/validate/:hashToken
router.get('/api/incidents/share-link/:hashToken/validate', async (req, res) => {
  const { hashToken } = req.params;
  
  const response = await incidentServiceClient.get(
    `/dept-tracking/validate/${hashToken}`
  );
  
  res.json(response.data);
});

// BFF Route: DELETE /api/incidents/share-link/:hashToken
// Delegates to incident-service /dept-tracking/revoke/:hashToken
router.delete('/api/incidents/share-link/:hashToken', async (req, res) => {
  const { hashToken } = req.params;
  
  const response = await incidentServiceClient.delete(
    `/dept-tracking/revoke/${hashToken}`
  );
  
  res.json(response.data);
});

// BFF Route: GET /api/departments/:departmentId/share-links
// Delegates to incident-service /dept-tracking/department/:departmentId
router.get('/api/departments/:departmentId/share-links', async (req, res) => {
  const { departmentId } = req.params;
  
  const response = await incidentServiceClient.get(
    `/dept-tracking/department/${departmentId}`
  );
  
  res.json(response.data);
});
```

---

## Flow Diagrams

### Share Incident Report Flow

```
1. City Admin creates incident
2. City Admin creates shareable link (POST /create)
   - scope: ASSIGNMENT_ONLY + assignmentId
   - Returns: JWT token
3. City Admin shares link with recipient
4. Recipient validates link (GET /validate/:hashToken)
5. Recipient uses JWT to access incident report
```

### Share Department Assignments Flow

```
1. Department Head creates shareable link (POST /create)
   - scope: DEPT_ACTIVE
   - No assignmentId required
   - Returns: JWT token
2. Department Head shares link with team
3. Recipients validate link (GET /validate/:hashToken)
4. Recipients use JWT to access all active department assignments
```

---

## Rate Limiting

- No specific rate limits enforced at API level
- Recommended: 100 requests/minute per user

---

## Webhook Events

None currently implemented. Links are stored in MongoDB collection `DeptTrackingToken`.

---

## Testing

### Test Scenarios

1. **Create Assignment-Only Link**
   - Create link with ASSIGNMENT_ONLY scope and assignmentId
   - Verify JWT is returned
   - Verify token is stored in database

2. **Create Department-Active Link**
   - Create link with DEPT_ACTIVE scope
   - Verify assignmentId is optional
   - Verify token is stored

3. **Validate Valid Link**
   - Create link, then validate it
   - Should return 200 with token metadata

4. **Validate Expired Link**
   - Create link with short expiry
   - Wait for expiry
   - Validate should return 404

5. **Revoke Link**
   - Create link
   - Revoke it
   - Attempt to validate should return 404

6. **List Department Links**
   - Create multiple links for department
   - List should return all active links
   - Revoked/expired links should not appear

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-08 | Initial API specification |

---

## Support & Contact

For issues or questions regarding the Department Tracking API, please contact:
- **Service Owner:** Incident Service Team
- **Slack Channel:** #incident-service-support
