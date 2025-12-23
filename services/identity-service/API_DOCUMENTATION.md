# API Documentation

## Base URL

```
http://localhost:3001
```

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <firebase-token>
```

Public endpoints (like `/rescuer/mission/verify`) do not require authentication.

## Response Format

All responses follow a standard format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## User Endpoints

### Register Citizen

**POST** `/users/register`

Create a new citizen account.

**Headers:**
```
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "municipalityCode": "CALUMPIT"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "firebaseUid": "abc123def456",
    "role": "citizen",
    "municipalityCode": "CALUMPIT",
    "registrationStatus": "active"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `401 UNAUTHORIZED` - Invalid or missing token
- `400 VALIDATION_ERROR` - Invalid municipality code

---

### Get Profile

**GET** `/users/me`

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <firebase-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "firebaseUid": "abc123def456",
    "role": "citizen",
    "email": "user@example.com",
    "displayName": "John Doe",
    "municipalityCode": "CALUMPIT",
    "registrationStatus": "active",
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `401 UNAUTHORIZED` - Invalid or missing token
- `404 NOT_FOUND` - User not found

---

### Update User Status

**PATCH** `/users/status`

Update a user's registration status. Only city_admin and above.

**Headers:**
```
Authorization: Bearer <city-admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_123456",
  "status": "suspended"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "role": "citizen",
    "registrationStatus": "suspended",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Valid Statuses:** `active`, `suspended`, `archived`

**Errors:**
- `403 INSUFFICIENT_PERMISSION` - User is not city_admin or above
- `404 NOT_FOUND` - User not found
- `400 VALIDATION_ERROR` - Invalid status

---

## Admin Endpoints

### Create Admin User

**POST** `/admin/users`

Create a new admin (city_admin or sos_admin). Only app_admin or city_admin can create.

**Headers:**
```
Authorization: Bearer <app-admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "city_admin",
  "email": "mayor@calumpit.gov.ph",
  "displayName": "Mayor Calumpit",
  "municipalityCode": "CALUMPIT",
  "phone": "+639123456789"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "admin_789012",
    "role": "city_admin",
    "email": "mayor@calumpit.gov.ph",
    "displayName": "Mayor Calumpit",
    "municipalityCode": "CALUMPIT",
    "registrationStatus": "pending"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Authority Rules:**
- `app_admin` can create: `city_admin`, `sos_admin`
- `city_admin` can create: `sos_admin` (same municipality only)

**Errors:**
- `403 INSUFFICIENT_PERMISSION` - Cannot create this role
- `403 MUNICIPALITY_ACCESS_DENIED` - Cannot access other municipality
- `400 VALIDATION_ERROR` - Invalid input
- `409 USER_ALREADY_EXISTS` - User with this email exists

---

### List Users

**GET** `/admin/users`

List users in the requester's scope.

**Headers:**
```
Authorization: Bearer <city-admin-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123456",
      "role": "citizen",
      "email": "citizen@example.com",
      "displayName": "John Doe",
      "municipalityCode": "CALUMPIT",
      "registrationStatus": "active"
    },
    {
      "id": "admin_789012",
      "role": "sos_admin",
      "email": "mdrrmo@calumpit.gov.ph",
      "municipalityCode": "CALUMPIT",
      "registrationStatus": "active"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Scope Rules:**
- `app_admin` - sees all users
- `city_admin` - sees users in their municipality
- `sos_admin` - sees users in their municipality

**Errors:**
- `403 INSUFFICIENT_PERMISSION` - Must be city_admin or above

---

### Get Audit Logs

**GET** `/admin/audit-logs`

Retrieve audit logs for compliance and investigation.

**Headers:**
```
Authorization: Bearer <city-admin-token>
```

**Query Parameters:**
```
?startDate=2024-01-01&endDate=2024-01-31&limit=50
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "audit_1234567890",
      "timestamp": "2024-01-15T10:30:00Z",
      "actorUserId": "admin_789012",
      "actorRole": "city_admin",
      "action": "create_city_admin",
      "municipalityCode": "CALUMPIT",
      "targetUserId": "admin_456789",
      "targetRole": "sos_admin",
      "metadata": {}
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Audit Actions:**
- `create_city_admin` - Created a city_admin
- `create_sos_admin` - Created a sos_admin
- `suspend_user` - Suspended a user
- `activate_user` - Activated a user
- `archive_user` - Archived a user
- `create_rescuer_mission` - Created a rescuer mission
- `revoke_rescuer_mission` - Revoked a rescuer mission
- `view_users` - Viewed user list
- `view_audit_logs` - Viewed audit logs

---

## Rescuer Endpoints

### Create Rescuer Mission

**POST** `/rescuer/mission`

Issue a mission token to a rescuer. Called by SOS Service when assigning rescuers.

**Headers:**
```
Authorization: Bearer <sos-admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sosId": "sos_abc123def456",
  "expiresInMinutes": 60
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "mission_sos_abc123def456_1234567890",
    "sosId": "sos_abc123def456",
    "token": "rescuer_sos_abc123def456_1234567890_xyz789",
    "expiresAt": "2024-01-15T11:30:00Z",
    "permissions": [
      "view_sos",
      "update_status",
      "send_location",
      "send_message"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Default Duration:** 60 minutes

**Errors:**
- `403 INSUFFICIENT_PERMISSION` - Must be city_admin or sos_admin
- `400 VALIDATION_ERROR` - Missing sosId

---

### Verify Mission Token

**GET** `/rescuer/mission/verify`

Verify a rescuer mission token. Public endpoint (no auth required).

**Query Parameters:**
```
?token=rescuer_sos_abc123def456_1234567890_xyz789
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sosId": "sos_abc123def456",
    "municipalityCode": "CALUMPIT",
    "expiresAt": "2024-01-15T11:30:00Z",
    "permissions": [
      "view_sos",
      "update_status",
      "send_location",
      "send_message"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `403 RESCUER_MISSION_EXPIRED` - Token expired or revoked
- `400 VALIDATION_ERROR` - Missing token

---

### Revoke Rescuer Mission

**POST** `/rescuer/mission/revoke`

Revoke a rescuer mission immediately. Only city_admin and sos_admin.

**Headers:**
```
Authorization: Bearer <sos-admin-token>
Content-Type: application/json
```

**Request Body (Option 1 - Single Mission):**
```json
{
  "missionId": "mission_sos_abc123def456_1234567890"
}
```

**Request Body (Option 2 - All for SOS):**
```json
{
  "sosId": "sos_abc123def456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Mission revoked"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `403 INSUFFICIENT_PERMISSION` - Must be city_admin or sos_admin
- `404 NOT_FOUND` - Mission not found

---

## Error Codes

| Code                         | HTTP | Description                              |
| ---------------------------- | ---- | ---------------------------------------- |
| UNAUTHORIZED                 | 401  | Invalid or missing authentication token  |
| INVALID_TOKEN                | 401  | Token is malformed or expired            |
| INSUFFICIENT_PERMISSION      | 403  | User role doesn't have required access   |
| FORBIDDEN                    | 403  | Action not permitted                     |
| MUNICIPALITY_ACCESS_DENIED   | 403  | Cannot access other municipality         |
| NOT_FOUND                    | 404  | Resource not found                       |
| USER_ALREADY_EXISTS          | 409  | User with email already exists           |
| VALIDATION_ERROR             | 400  | Input validation failed                  |
| MISSING_MUNICIPALITY_CODE    | 400  | Role requires municipalityCode           |
| CANNOT_CREATE_ADMIN          | 403  | Cannot create this admin role            |
| RESCUER_MISSION_EXPIRED      | 403  | Mission token expired or revoked         |
| RESCUER_MISSION_NOT_FOUND    | 404  | No valid mission found                   |
| DATABASE_ERROR               | 500  | Database operation failed                |
| FIREBASE_AUTH_ERROR          | 401  | Firebase authentication failed           |
| INTERNAL_SERVER_ERROR        | 500  | Unexpected server error                  |

---

## Rate Limiting

Recommended for production:
- 100 requests/minute for authenticated endpoints
- 10 requests/minute for public endpoints
- 1000 requests/minute for /rescuer/mission/verify

---

## Examples

### Creating a City Admin (as App Admin)

```bash
curl -X POST http://localhost:3001/admin/users \
  -H "Authorization: Bearer app_admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "city_admin",
    "email": "it@calumpit.gov.ph",
    "displayName": "IT Officer Calumpit",
    "municipalityCode": "CALUMPIT"
  }'
```

### Creating a Rescuer Mission (as SOS Admin)

```bash
curl -X POST http://localhost:3001/rescuer/mission \
  -H "Authorization: Bearer sos_admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "sosId": "sos_2024_001",
    "expiresInMinutes": 60
  }'
```

### Verifying a Rescuer Mission (Public)

```bash
curl -X GET "http://localhost:3001/rescuer/mission/verify?token=rescuer_sos_2024_001_1234567890_xyz"
```
