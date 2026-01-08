# ShareLink API Specifications

## Overview

The ShareLink API enables the creation, validation, and management of shareable links for incident reports. These links can be scoped to specific assignments or entire department assignments, allowing city admins to share incident tracking access with other users.

**Base URL:** `/api/sharelink`
**Service:** BFF Admin Service
**Authentication:** Bearer Token (JWT) - Required for create, revoke, and list operations

---

## API Endpoints

### 1. Create Shareable Link

**Create a shareable link for incident/assignment tracking**

```http
POST /api/sharelink/
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
  "incidentId": "string (required)"
}
```

#### Response

**Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb250ZXh0VHlwZSI6IlNIQVJFX0xJTksiLCJjb250ZXh0VXNhZ2UiOiJSRVBPUlRfQVNTSUdOTUVOVCIsImlkZW50aXR5Ijp7ImluY2lkZW50SWQiOiJpbmNpZGVudC00NTYiLCJjaXR5SWQiOiJtYW5pbGEifSwiYWN0b3IiOnsiZGVwYXJ0bWVudElkIjoiZmlyZS1kZXB0LTAwMSIsImFzc2lnbm1lbnRJZCI6ImFzc2lnbi0xMjMifSwiaWF0IjoxNzA0NzE2NjAwLCJleHAiOjE3MDQ4MDMwMDB9.signature",
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
curl -X POST http://localhost:8080/api/sharelink/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "cityId": "manila",
    "departmentId": "fire-dept-001",
    "scope": "ASSIGNMENT_ONLY",
    "assignmentId": "assign-123",
    "incidentId": "incident-456"
  }'
```

**For department assignments:**
```bash
curl -X POST http://localhost:8080/api/sharelink/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "cityId": "manila",
    "departmentId": "fire-dept-001",
    "scope": "DEPT_ACTIVE",
    "incidentId": "incident-456"
  }'
```

---

### 2. Validate Shareable Link

**Validate a shareable link and retrieve its metadata**

```http
GET /api/sharelink/validate/:hashToken
```

#### Request

**Path Parameters:**
- `hashToken` (string, required): The hash token from the shareable link

**Headers:**
```
Content-Type: application/json
```

**Note:** No authentication required - public endpoint

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
curl -X GET http://localhost:8080/api/sharelink/validate/abc123def456xyz \
  -H "Content-Type: application/json"
```

---

### 3. Revoke Shareable Link

**Revoke a shareable link to disable access**

```http
DELETE /api/sharelink/revoke/:hashToken
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
curl -X DELETE http://localhost:8080/api/sharelink/revoke/abc123def456xyz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 4. Get Active Links by Department

**Retrieve all active shareable links for a department**

```http
GET /api/sharelink/department/:departmentId
```

#### Request

**Path Parameters:**
- `departmentId` (string, required): The department ID

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
curl -X GET http://localhost:8080/api/sharelink/department/fire-dept-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Frontend Integration Examples

### React Hook for Creating Share Links

```typescript
import { useState } from 'react';

export const useShareLink = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShareLink = async (
    incidentId: string,
    scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE',
    assignmentId?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sharelink/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cityId: localStorage.getItem('cityId'),
          departmentId: localStorage.getItem('departmentId'),
          incidentId,
          scope,
          assignmentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create share link');
      }

      const data = await response.json();
      return data.data.jwt;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateShareLink = async (hashToken: string) => {
    try {
      const response = await fetch(`/api/sharelink/validate/${hashToken}`);
      
      if (!response.ok) {
        throw new Error('Link is invalid or expired');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation failed';
      setError(message);
      throw err;
    }
  };

  const revokeShareLink = async (hashToken: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sharelink/revoke/${hashToken}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to revoke share link');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getActiveDeptLinks = async (departmentId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sharelink/department/${departmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active links');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createShareLink,
    validateShareLink,
    revokeShareLink,
    getActiveDeptLinks,
    loading,
    error
  };
};
```

### React Component Example

```typescript
import React, { useState } from 'react';
import { useShareLink } from './useShareLink';

interface ShareLinkProps {
  incidentId: string;
  assignmentId?: string;
}

export const ShareLinkComponent: React.FC<ShareLinkProps> = ({ incidentId, assignmentId }) => {
  const { createShareLink, loading, error } = useShareLink();
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleCreateLink = async (scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE') => {
    try {
      const jwt = await createShareLink(incidentId, scope, assignmentId);
      setShareLink(jwt);
      
      // Generate shareable URL
      const shareUrl = `${window.location.origin}/share/${jwt}`;
      console.log('Share URL:', shareUrl);
    } catch (err) {
      console.error('Failed to create share link:', err);
    }
  };

  return (
    <div className="share-link-container">
      <h3>Share Incident Report</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="button-group">
        <button
          onClick={() => handleCreateLink('ASSIGNMENT_ONLY')}
          disabled={loading || !assignmentId}
          title={!assignmentId ? 'Assignment ID required' : ''}
        >
          {loading ? 'Creating...' : 'Share Assignment'}
        </button>
        
        <button
          onClick={() => handleCreateLink('DEPT_ACTIVE')}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Share Department'}
        </button>
      </div>

      {shareLink && (
        <div className="share-link-result">
          <p>Share this link:</p>
          <input 
            type="text" 
            value={shareLink} 
            readOnly 
            className="link-input"
          />
          <button 
            onClick={() => navigator.clipboard.writeText(shareLink)}
            className="copy-button"
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
};
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
| `POST /` | CITY_ADMIN | Create shareable links |
| `GET /validate/:hashToken` | Public | Validate tokens without auth |
| `DELETE /revoke/:hashToken` | CITY_ADMIN | Revoke own department links |
| `GET /department/:departmentId` | CITY_ADMIN | View department links |

### Bearer Token Format

```
Authorization: Bearer <jwt_token>
```

The token should be obtained from the identity service authentication endpoint.

---

## Rate Limiting

- Recommended: 100 requests/minute per user
- No hard limits enforced at BFF level

---

## Flow Diagrams

### Share Incident Report Flow

```
Frontend User
    ↓
1. Click "Share Assignment"
    ↓
2. Frontend calls: POST /api/sharelink/
   {
     incidentId: "incident-456",
     scope: "ASSIGNMENT_ONLY",
     assignmentId: "assign-123"
   }
    ↓
3. BFF delegates to: POST /dept-tracking/create
    ↓
4. Incident Service generates JWT & stores token
    ↓
5. Return JWT token to frontend
    ↓
6. Frontend displays shareable link/URL
    ↓
7. User copies and shares link
    ↓
8. Recipient opens link → Frontend calls: GET /api/sharelink/validate/:hashToken
    ↓
9. Validate token & grant access to incident report
```

### Share Department Assignments Flow

```
Frontend User
    ↓
1. Click "Share Department"
    ↓
2. Frontend calls: POST /api/sharelink/
   {
     incidentId: "incident-456",
     scope: "DEPT_ACTIVE"
   }
    ↓
3. BFF delegates to: POST /dept-tracking/create
    ↓
4. Incident Service generates JWT (no assignmentId)
    ↓
5. Return JWT token
    ↓
6. Team members can access all active assignments via this link
```

---

## Testing Scenarios

### 1. Create and Share Assignment Link
```javascript
// Create assignment-only link
const response = await fetch('/api/sharelink/', {
  method: 'POST',
  body: JSON.stringify({
    incidentId: 'test-incident-1',
    scope: 'ASSIGNMENT_ONLY',
    assignmentId: 'test-assign-1'
  }),
  headers: { 'Authorization': 'Bearer ...' }
});

const { data } = await response.json();
console.log('JWT:', data.jwt);
```

### 2. Validate Link Before Access
```javascript
// Check if link is valid before allowing user
const validateResponse = await fetch(
  `/api/sharelink/validate/${shareToken}`
);

if (validateResponse.ok) {
  // Grant access
} else {
  // Show "Link expired" message
}
```

### 3. Revoke Link
```javascript
// Admin revokes a shared link
await fetch(`/api/sharelink/revoke/${shareToken}`, {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer ...' }
});
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-08 | Initial API specification |

---

## Support & Contact

For issues or questions regarding the ShareLink API, contact:
- **Frontend Team Lead**: [contact info]
- **BFF Team**: [contact info]
- **Slack Channel**: #sharelink-support
