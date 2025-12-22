# Identity Service - Complete Project Overview

## 🎯 Mission

Create a **3-tier admin governance microservice** for the Gov-Ph ecosystem that enforces strict role-based access control with municipality scoping, immutable audit logging, and mission-based rescuer access.

## 📁 Project Structure

```
identity-service/
├── src/
│   ├── app.ts                          # Express app initialization & middleware
│   ├── server.ts                       # Server startup & graceful shutdown
│   │
│   ├── config/
│   │   └── database.ts                 # MongoDB connection & collection registry
│   │
│   ├── types/
│   │   └── index.ts                    # All TypeScript interfaces & constants
│   │                                     - UserEntity, UserRole, RegistrationStatus
│   │                                     - RescuerMission, RescuerPermission
│   │                                     - AuditLogEntry, AuditAction
│   │                                     - AUTHORITY_RULES, PERMISSION_MATRIX
│   │
│   ├── errors/
│   │   └── index.ts                    # Custom error classes
│   │                                     - IdentityServiceError base
│   │                                     - UnauthorizedError, ForbiddenError
│   │                                     - ValidationError, NotFoundError
│   │                                     - CannotCreateAdminError
│   │                                     - RescuerMissionExpiredError
│   │
│   ├── middleware/
│   │   └── requireRole.ts              # RBAC enforcement middleware
│   │                                     - requireRole(roles[])
│   │                                     - requireMunicipalityScope()
│   │                                     - requireAppAdmin()
│   │                                     - requireCityAdmin()
│   │                                     - requireSOSAdmin()
│   │
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.mongo.schema.ts    # MongoDB user schema
│   │   │   ├── user.service.ts         # User CRUD operations
│   │   │   ├── user.controller.ts      # HTTP handlers
│   │   │   │                            - registerCitizen
│   │   │   │                            - getProfile
│   │   │   │                            - updateUserStatus
│   │   │   └── user.routes.ts          # Express routes
│   │   │
│   │   ├── admin/
│   │   │   ├── admin.controller.ts     # Admin management HTTP handlers
│   │   │   │                            - createAdmin
│   │   │   │                            - listUsers
│   │   │   │                            - getAuditLogs
│   │   │   └── admin.routes.ts         # Express routes
│   │   │
│   │   └── rescuer/
│   │       ├── rescuer.mongo.schema.ts # MongoDB rescuer mission schema
│   │       ├── rescuer.service.ts      # Mission lifecycle management
│   │       │                            - createMission
│   │       │                            - verifyMissionToken
│   │       │                            - revokeMission
│   │       ├── rescuer.controller.ts   # HTTP handlers
│   │       │                            - createMission
│   │       │                            - verifyMission
│   │       │                            - revokeMission
│   │       └── rescuer.routes.ts       # Express routes
│   │
│   ├── services/
│   │   ├── auditLogger.ts              # Audit logging service
│   │   │                                - AuditLoggerService class
│   │   │                                - logUserCreated()
│   │   │                                - logStatusChange()
│   │   │                                - logRescuerMissionCreated()
│   │   │                                - logRescuerMissionRevoked()
│   │   └── auditLog.mongo.schema.ts    # MongoDB audit log schema
│   │
│   ├── utils/
│   │   ├── logger.ts                   # Structured logging utility
│   │   │                                - Logger class
│   │   │                                - createLogger(context)
│   │   └── validators.ts               # Input validation helpers
│   │                                     - validateEmail()
│   │                                     - validatePhoneNumber()
│   │                                     - validateMunicipalityCode()
│   │                                     - validateMunicipalityForRole()
│   │                                     - validateUserCreationPayload()
│   │
│   └── types/
│       └── index.ts                    # Re-exported main types file
│
├── package.json                        # Dependencies & scripts
├── tsconfig.json                       # TypeScript configuration
│
├── README.md                           # Project overview & quick start
├── API_DOCUMENTATION.md                # Complete API reference with examples
├── IMPLEMENTATION.md                   # Architecture decisions & technical specs
├── RBAC_SPECIFICATION.md               # Role definitions & access control matrix
├── .env.example                        # Environment variable template
└── .gitignore                          # Git ignore rules
```

## 🔑 Key Features

### ✅ 3-Tier Admin Governance

| Level     | Scope              | Authority                    |
| --------- | ------------------ | ---------------------------- |
| APP_ADMIN | System-wide        | Create city_admin, sos_admin |
| CITY_ADMIN| One municipality   | Create sos_admin             |
| SOS_ADMIN | Emergency ops only | Issue rescuer missions       |

### ✅ Mission-Based Rescuers

- **NOT users** - Temporary access tokens only
- **Time-limited** - Default 60 minutes
- **SOS-scoped** - Access only assigned incident
- **Revocable** - Can be terminated immediately
- **Hard-coded permissions** - No escalation possible

### ✅ Municipality Isolation

- City/SOS admin locked to ONE municipality
- Cannot create users outside their boundary
- Cannot view/manage other municipalities
- Clear data ownership

### ✅ Legal-Grade Audit Logging

- Every privileged action logged immutably
- 2-year retention (auto-delete via TTL)
- Includes: actor, action, target, municipality, timestamp
- Separate read-only collection
- Non-repudiation guarantee

### ✅ Strict Authority Rules

```ts
AUTHORITY_RULES = {
  app_admin: ['city_admin', 'sos_admin'],
  city_admin: ['sos_admin'],
  sos_admin: [],
  citizen: [],
}
```

## 🚀 Quick Start

### Installation

```bash
cd identity-service
npm install
```

### Configuration

Create `.env`:
```
MONGODB_URI=mongodb://localhost:27017/identity-service
PORT=3001
NODE_ENV=development
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## 📡 API Overview

### User Endpoints

```
POST   /users/register               Citizen self-registration
GET    /users/me                     Get profile
PATCH  /users/status                 Update user status (admin)
```

### Admin Endpoints

```
POST   /admin/users                  Create admin user
GET    /admin/users                  List users (scoped)
GET    /admin/audit-logs             Retrieve audit logs
```

### Rescuer Endpoints

```
POST   /rescuer/mission              Issue mission token
GET    /rescuer/mission/verify       Verify mission (public)
POST   /rescuer/mission/revoke       Revoke mission
```

## 🔐 Authority Examples

### Creating a City Admin (app_admin)

```bash
curl -X POST http://localhost:3001/admin/users \
  -H "Authorization: Bearer app_admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "city_admin",
    "email": "mayor@calumpit.gov.ph",
    "municipalityCode": "CALUMPIT"
  }'
```

### Creating a Rescuer Mission (sos_admin)

```bash
curl -X POST http://localhost:3001/rescuer/mission \
  -H "Authorization: Bearer sos_admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "sosId": "sos_2024_001",
    "expiresInMinutes": 60
  }'
```

### Verifying Rescuer Mission (Public)

```bash
curl -X GET "http://localhost:3001/rescuer/mission/verify?token=rescuer_token_xyz"
```

## 🧠 Core Principles

> **Admins govern systems.
> SOS Admins govern emergencies.
> Rescuers govern moments.
> Citizens govern themselves.**

1. **Role Hierarchy is Non-Negotiable**
   - Clear authority chain (app → city → sos)
   - No sideways movement (can't create sister roles)
   - No self-elevation (can't create own role)

2. **Municipality Boundaries are Strict**
   - city_admin and sos_admin are municipality-locked
   - Cross-municipality access rejected immediately
   - Isolation enforced at database query level

3. **Audit Everything**
   - Every privileged action logged
   - Immutable (insert-only, never delete)
   - 2-year retention for LGU accountability

4. **Rescuers are Mission-Based**
   - No persistent accounts
   - Time-limited tokens
   - Single-SOS scope
   - No login required

5. **Errors are Explicit**
   - Custom error classes for every scenario
   - Machine-readable codes
   - Human-readable messages
   - Proper HTTP status codes

## 📊 Database Schema

### Users Collection

```json
{
  "_id": "user_123",
  "firebaseUid": "abc123def456",
  "role": "citizen",
  "email": "user@example.com",
  "phone": "+639123456789",
  "displayName": "John Doe",
  "municipalityCode": "CALUMPIT",
  "department": null,
  "registrationStatus": "active",
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Indices:**
- `firebaseUid` (unique)
- `email` (unique)
- `role, municipalityCode` (compound)

### Rescuer Missions Collection

```json
{
  "_id": "mission_sos_abc123_1234567890",
  "sosId": "sos_abc123def456",
  "municipalityCode": "CALUMPIT",
  "token": "rescuer_sos_abc123_1234567890_xyz",
  "expiresAt": "2024-01-15T11:30:00Z",
  "permissions": ["view_sos", "update_status", "send_location", "send_message"],
  "createdByUserId": "admin_789012",
  "createdByRole": "sos_admin",
  "createdAt": "2024-01-15T10:30:00Z",
  "revokedAt": null
}
```

**Indices:**
- `token` (unique)
- `sosId, revokedAt, expiresAt` (compound)
- TTL on `expiresAt` (7 days)

### Audit Logs Collection

```json
{
  "_id": "audit_1234567890",
  "timestamp": "2024-01-15T10:30:00Z",
  "actorUserId": "admin_789012",
  "actorRole": "city_admin",
  "action": "create_sos_admin",
  "municipalityCode": "CALUMPIT",
  "targetUserId": "admin_456789",
  "targetRole": "sos_admin",
  "metadata": {}
}
```

**Indices:**
- `timestamp, municipalityCode` (compound)
- TTL on `timestamp` (2 years)

## 🛡️ Security Features

### Authentication

- Firebase token verification (via Authorization header)
- Token stored in `req.user` by middleware

### Authorization

- Role-based access control (RBAC)
- Municipality scope enforcement
- Authority rule validation
- Audit logging for all privileged actions

### Input Validation

- Email format validation
- Phone number validation
- Municipality code validation
- Firebase UID validation
- String sanitization

### Error Handling

- Custom error classes
- Explicit error codes
- Secure error messages (no stack traces in prod)
- Proper HTTP status codes

## 📈 Deployment Ready

### Environment Variables

```env
MONGODB_URI               # MongoDB connection
PORT                      # Server port (default: 3001)
NODE_ENV                  # Environment (dev/staging/prod)
FIREBASE_PROJECT_ID       # Firebase project
```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### Scalability

- Stateless design (no sessions)
- MongoDB for persistence
- Horizontal scaling ready
- No hard dependencies on external services

## 📚 Documentation

1. **README.md** - Project overview & setup
2. **API_DOCUMENTATION.md** - Complete API reference
3. **IMPLEMENTATION.md** - Architecture & technical specs
4. **RBAC_SPECIFICATION.md** - Role definitions & matrices
5. **.env.example** - Environment template

## 🧪 Testing Strategy

### Unit Tests (Recommended)

- Validators (email, phone, municipality code)
- Error classes
- Authority rules
- Permission matrix

### Integration Tests (Recommended)

- User creation flow
- Admin creation with authority checks
- Rescuer mission lifecycle
- Audit logging
- Municipality scoping
- Error handling

### E2E Tests (Recommended)

- Full citizen registration
- Admin user creation
- Rescuer mission issuance
- Audit log retrieval

## 🔮 Future Enhancements

1. JWT for rescuer tokens (currently simple tokens)
2. Email invitation for admin accounts
3. Rate limiting for production
4. Two-factor authentication for admins
5. API key management for service-to-service
6. Real-time admin activity dashboard
7. Multi-language error messages
8. MongoDB transactions for critical operations

## 📞 Integration Points

### With SOS Service

- `POST /rescuer/mission` - SOS calls to issue rescuer token
- `POST /rescuer/mission/revoke` - SOS calls to end mission
- `GET /rescuer/mission/verify` - Rescuer app verifies token

### With E-Citizen Service

- `POST /users/register` - Citizens register
- `GET /users/me` - Get profile
- `PATCH /users/status` - Admins manage accounts

### With Firebase

- Receives Bearer token in Authorization header
- Verifies token signature
- Extracts `firebaseUid` for user identification

## 🎓 Learning Resources

- **src/types/index.ts** - Start here for data models
- **src/middleware/requireRole.ts** - RBAC enforcement patterns
- **src/modules/user/user.service.ts** - CRUD service pattern
- **src/modules/admin/admin.controller.ts** - Authority rule enforcement
- **src/services/auditLogger.ts** - Audit logging pattern
- **RBAC_SPECIFICATION.md** - Role hierarchy & permissions

## ✅ Compliance Checklist

- ✅ Role-based access control
- ✅ Municipality data isolation
- ✅ Immutable audit logging (2 years)
- ✅ Non-repudiation (audit trail)
- ✅ Clear authority rules (documented)
- ✅ Scalable for national deployment
- ✅ Error handling and recovery
- ⚠️ Encryption (at-rest & in-transit) - Recommended
- ⚠️ Backup & disaster recovery - Must implement
- ⚠️ Incident response procedures - Must document

## 📝 License

MIT

---

**Built for Gov-Ph E-Government with ❤️ for LGU autonomy and national scalability.**
