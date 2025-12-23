# IMPLEMENTATION SPECIFICATION

## Overview

The Identity Service implements a 3-tier admin governance system with strict authority rules, municipality scoping, and mission-based rescuer access.

## Architecture Decision Records

### 1. **Non-User Rescuers** ✅

**Decision:** Rescuers are NOT users in the identity system. They receive time-limited mission tokens.

**Why:**
- No persistent accounts to manage
- No role escalation possible
- Easy revocation
- Simpler integration with SOS service
- Mobile-friendly (SMS/QR code delivery)

**Implementation:**
- `POST /rescuer/mission` issues temporary token
- Token expires after configured duration (default: 60 min)
- `GET /rescuer/mission/verify` validates without session
- `POST /rescuer/mission/revoke` terminates access immediately

### 2. **Municipality Isolation** ✅

**Decision:** city_admin and sos_admin are strictly scoped to one municipality.

**Why:**
- LGU autonomy (mayors control their jurisdiction)
- Data protection (prevent cross-municipality access)
- Audit clarity (easy to track who did what where)
- Horizontal scalability (add new municipalities without code changes)

**Implementation:**
- `municipalityCode` is mandatory for admin roles
- Middleware `requireMunicipalityScope()` enforces boundaries
- city_admin cannot create users for other municipalities
- app_admin can view/manage all municipalities

### 3. **Immutable Audit Logging** ✅

**Decision:** Every privileged action is logged for legal compliance.

**Why:**
- LGU accountability (2-year retention for investigation)
- Non-repudiation (can't deny actions)
- Compliance (auditable for national regulations)
- Forensics (track incidents)

**Implementation:**
- `AuditLoggerService` logs all admin operations
- 2-year TTL on MongoDB (auto-delete after 730 days)
- Includes: actor, action, target, municipality, timestamp
- Separate `audit_logs` collection (immutable writes only)

### 4. **Authority Rules as Code** ✅

**Decision:** Role hierarchy is enforced in code, not database queries.

**Why:**
- Single source of truth (no ambiguity)
- Easy to audit ("who can create whom?")
- Prevents mistakes in role creation

**Implementation:**
- `AUTHORITY_RULES` constant defines hierarchy
- `CannotCreateAdminError` thrown on violation
- Checked before any user creation

```ts
export const AUTHORITY_RULES: Record<UserRole, Readonly<UserRole[]>> = {
  app_admin: ['city_admin', 'sos_admin'],
  city_admin: ['sos_admin'],
  sos_admin: [],
  citizen: [],
};
```

## Entity Models

### User

```ts
interface UserEntity {
  id: string;                         // Unique user ID
  firebaseUid: string;                // Firebase auth UID
  role: 'app_admin' | 'city_admin' | 'sos_admin' | 'citizen';
  email?: string;                     // Unique if provided
  phone?: string;
  displayName?: string;
  municipalityCode?: string;          // REQUIRED for admins
  department?: 'MDRRMO' | 'PNP' | 'BFP' | 'LGU';  // For sos_admin
  registrationStatus: 'pending' | 'active' | 'suspended' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
```

**Indices:**
- `firebaseUid` (unique)
- `email` (unique)
- `role, municipalityCode` (compound)
- `registrationStatus, municipalityCode` (compound)

### Rescuer Mission

```ts
interface RescuerMission {
  id: string;                         // mission_sosId_timestamp
  sosId: string;                      // SOS this mission is for
  municipalityCode: string;           // For audit/tracking
  token: string;                      // Mission token
  expiresAt: Date;                    // Auto-delete after 7 days
  permissions: RescuerPermission[];   // view_sos, update_status, send_location, send_message
  createdByUserId: string;
  createdByRole: UserRole;
  createdAt: Date;
  revokedAt?: Date;                   // If revoked before expiry
}
```

**Indices:**
- `sosId, revokedAt, expiresAt` (compound for active missions)
- `token` (unique)
- TTL on `expiresAt` (7 days auto-cleanup)

### Audit Log

```ts
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actorUserId: string;
  actorRole: UserRole;
  action: AuditAction;                // create_city_admin, suspend_user, etc.
  municipalityCode?: string;
  targetUserId?: string;
  targetRole?: UserRole;
  metadata?: Record<string, unknown>;
}
```

**Indices:**
- `timestamp, municipalityCode` (compound)
- `actorUserId, timestamp` (compound)
- `action, timestamp` (compound)
- TTL on `timestamp` (2 years)

## API Flow Diagrams

### Citizen Registration

```
E-Citizen App
    │
    ├─ Firebase Auth (separate service)
    │
    ├─ POST /users/register
    │  {firebaseUid, municipalityCode}
    │
    └─> Identity Service
        └─ Create User (role=citizen)
        └─ Return user profile
```

### Admin Creation

```
APP_ADMIN (Web Dashboard)
    │
    ├─ Firebase Auth
    │
    ├─ POST /admin/users
    │  {role: city_admin, email, municipalityCode}
    │
    └─> Identity Service
        ├─ Check: Can APP_ADMIN create city_admin? YES
        ├─ Create User (role=city_admin, status=pending)
        ├─ Log: audit_logs.create_city_admin
        └─ Return user + admin link (for email invite)
        
        [Later, city_admin uses email link to claim account]
```

### Rescuer Mission Issuance

```
SOS Service (when assigning rescuer)
    │
    ├─ POST /rescuer/mission
    │  {sosId, expiresInMinutes=60}
    │  (Authorization: SOS_ADMIN token)
    │
    └─> Identity Service
        ├─ Create RescuerMission
        ├─ Generate limited-scope token
        ├─ Log: audit_logs.create_rescuer_mission
        └─ Return token
        
        SOS Service
        └─ Send to rescuer: SMS "Click: <shortlink>?token=..."
        
        Rescuer App
        ├─ GET /rescuer/mission/verify?token=...
        ├─ Validates: Not expired, not revoked
        └─ Grants access to SOS details for 60 min
```

### Rescuer Mission Revocation

```
SOS Service (when incident ends or reassigning)
    │
    ├─ POST /rescuer/mission/revoke
    │  {sosId} or {missionId}
    │  (Authorization: SOS_ADMIN token)
    │
    └─> Identity Service
        ├─ Mark mission: revokedAt = now
        ├─ Log: audit_logs.revoke_rescuer_mission
        └─ Return success
        
        Rescuer App
        └─ Next API call with token fails: RESCUER_MISSION_EXPIRED
```

## Role-Based Access Control

### Permission Matrix

| Feature                  | app_admin | city_admin | sos_admin | citizen | rescuer |
| ------------------------ | --------- | ---------- | --------- | ------- | ------- |
| Create city_admin        | ✅         | ❌         | ❌         | ❌       | ❌       |
| Create sos_admin         | ✅         | ✅         | ❌         | ❌       | ❌       |
| View all users           | ✅         | ❌         | ❌         | ❌       | ❌       |
| View municipality users  | ✅         | ✅         | ✅         | ❌       | ❌       |
| Suspend/activate users   | ✅         | ✅         | ❌         | ❌       | ❌       |
| Create rescuer mission   | ❌         | ✅         | ✅         | ❌       | ❌       |
| Revoke rescuer mission   | ❌         | ✅         | ✅         | ❌       | ❌       |
| View audit logs          | ✅         | ✅ (own)   | ✅ (own)   | ❌       | ❌       |
| Create SOS               | ❌         | ❌         | ❌         | ✅       | ❌       |
| Access SOS (mission only)| ❌         | ❌         | ❌         | ❌       | ✅       |

### Middleware Helpers

```ts
requireAuth()              // Any authenticated user
requireRole([roles])       // Specific role(s)
requireAppAdmin()          // app_admin only
requireCityAdmin()         // app_admin or city_admin
requireSOSAdmin()          // app_admin, city_admin, or sos_admin
requireMunicipalityScope() // Prevent cross-municipality access
```

## Error Handling

### Custom Error Classes

All errors inherit from `IdentityServiceError` with:
- `code` - Machine-readable code
- `message` - Human-readable message
- `statusCode` - HTTP status

**Examples:**
```ts
throw new UnauthorizedError('No token provided');              // 401
throw new ForbiddenError('Cannot delete admin');              // 403
throw new InsufficientPermissionError('app_admin', 'citizen'); // 403
throw new ValidationError('Email required', 'email');         // 400
throw new NotFoundError('User', 'user_123');                  // 404
throw new CannotCreateAdminError('city_admin', 'app_admin');  // 403
```

### Global Error Handler

Express error middleware catches all thrown errors and returns:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Security Considerations

### 1. **Input Validation**

- Email format validation
- Phone number format validation
- Municipality code format validation
- Firebase UID length/format validation
- Sanitization of user inputs

### 2. **Authorization Enforcement**

- Every endpoint checks `req.user.role`
- Municipality scope checks prevent cross-boundary access
- Authority rules prevent invalid role escalation
- Audit log all privileged operations

### 3. **MongoDB Security**

- Unique indices on `firebaseUid`, `email`, `token`
- No plain-text passwords (Firebase handles auth)
- TTL indices for automatic cleanup
- Immutable audit logs (insert-only)

### 4. **Token Management**

- Rescuer tokens are scoped (to sosId, municipalityCode, permissions)
- Tokens expire automatically
- Tokens can be revoked immediately
- No token refresh mechanism (must get new mission)

### 5. **Audit Trail**

- All admin actions logged immutably
- 2-year retention
- Includes actor, action, target, municipality, timestamp
- Can be queried for forensics

## Integration Points

### With SOS Service

**Identity Service → SOS Service:**
- Identity doesn't directly call SOS
- SOS calls `/rescuer/mission` to get tokens

**SOS Service → Identity Service:**
- `POST /rescuer/mission` - Create mission
- `POST /rescuer/mission/revoke` - Revoke mission
- `GET /rescuer/mission/verify` - Verify rescuer access (from rescuer app)

### With E-Citizen Service

**E-Citizen Service → Identity Service:**
- `POST /users/register` - Register new citizen
- `GET /users/me` - Get profile
- `PATCH /users/status` - Update status (admins only)

### With Firebase

**Firebase → Identity Service:**
- Identity Service receives token in Authorization header
- Verifies token with Firebase Admin SDK
- Extracts `firebaseUid` and adds to `req.user`

## Testing Strategy

### Unit Tests

- Validators (email, phone, municipality code)
- Error classes
- Authority rules
- Permission matrix

### Integration Tests

- User creation flow
- Admin creation flow
- Rescuer mission lifecycle
- Audit logging
- Municipality scoping
- Error handling

### E2E Tests

- Full citizen registration
- Admin user creation
- Rescuer mission issuance and verification
- Audit log retrieval

## Deployment

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Firebase Project (for token verification)

### Environment Variables

```
MONGODB_URI               # MongoDB connection string
PORT                      # Server port (default: 3001)
NODE_ENV                  # Environment (dev/staging/prod)
FIREBASE_PROJECT_ID       # Firebase project ID
```

### Build & Run

```bash
npm install
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

## Monitoring & Logging

### Structured Logging

All logs include:
- `timestamp` - ISO 8601
- `level` - DEBUG, INFO, WARN, ERROR
- `context` - Module name
- `message` - Log message
- `data` - Optional contextual data

Example:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "context": "UserService",
  "message": "User created",
  "data": { "userId": "user_123", "role": "citizen" }
}
```

### Key Metrics to Monitor

- User registration rate
- Admin user creation rate
- Rescuer mission issuance rate
- Mission revocation rate
- API response times
- Error rates by endpoint
- Audit log volume

## Known Limitations & Future Work

### Current Limitations

1. **Firebase Integration** - Simplified auth (production needs real token verification)
2. **Email Invitations** - Not yet implemented (TODO in admin.controller.ts)
3. **Rate Limiting** - Not implemented (recommended for production)
4. **JWT for Rescuer Tokens** - Using simple tokens (should use JWT with expiry)
5. **MongoDB Transactions** - Not using transactions (consider for critical operations)

### Future Enhancements

1. **Two-Factor Authentication** - For admin accounts
2. **API Key Management** - For service-to-service calls
3. **Role Permissions Matrix** - More granular control
4. **Batch Operations** - Create multiple admins at once
5. **Admin Activity Dashboard** - Real-time monitoring
6. **Multi-Language Support** - Error messages in Filipino

## Compliance

### LGU Grade Checklist

- ✅ Role-based access control
- ✅ Municipality data isolation
- ✅ Immutable audit logging (2 years)
- ✅ Non-repudiation (can't deny actions)
- ✅ Clear authority rules
- ✅ Scalable for national deployment
- ✅ Error handling and recovery
- ⚠️ Encryption (at-rest and in-transit) - Recommended for production
- ⚠️ Backup and disaster recovery - Must implement
- ⚠️ Incident response procedures - Must document
