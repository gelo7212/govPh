# Identity Microservice

🆔 **3-Tier Admin Governance for E-Government**

An authoritative identity service for the Gov-Ph ecosystem, implementing strict role-based access control (RBAC) with clear governance boundaries for municipalities, emergency operations, and citizens.

## Features

✅ **3-Tier Admin System**
- **APP_ADMIN**: System-wide governance (national level)
- **CITY_ADMIN**: Municipality-scoped administration
- **SOS_ADMIN**: Emergency operations only

✅ **Mission-Based Rescuer Access**
- Rescuers are NOT users
- Time-limited access tokens for SOS responses
- No persistent accounts or login

✅ **LGU-Grade Security**
- Immutable audit logging for all admin actions
- Municipality data isolation
- Non-negotiable authority rules
- 2-year audit retention

✅ **Scalable Architecture**
- MongoDB for persistence
- RESTful API design
- Clean separation of concerns
- Ready for national deployment

## Admin Levels

| Role       | Scope              | Who                     |
| ---------- | ------------------ | ----------------------- |
| APP_ADMIN  | Whole platform     | System owner / national |
| CITY_ADMIN | One municipality   | Mayor's office / IT     |
| SOS_ADMIN  | Emergency ops only | MDRRMO / responders     |
| CITIZEN    | Personal access    | Public                  |
| RESCUER    | Single SOS         | Login-less              |

## Authority Rules

**Who Can Create Whom**

| Creator        | Can Create              |
| -------------- | ----------------------- |
| **APP_ADMIN**  | city_admin, sos_admin   |
| **CITY_ADMIN** | sos_admin               |
| **SOS_ADMIN**  | ❌ users                 |
| **Citizen**    | ❌                       |
| **System**     | citizen (self-register) |

## API Endpoints

### User Management

```
POST   /users/register          Citizen self-registration
GET    /users/me                Get current user profile
PATCH  /users/status            Update user status (admin)
```

### Admin Management

```
POST   /admin/users             Create admin user
GET    /admin/users             List users in scope
GET    /admin/audit-logs        Retrieve audit logs
```

### Rescuer Missions

```
POST   /rescuer/mission         Create mission token
GET    /rescuer/mission/verify  Verify mission (public)
POST   /rescuer/mission/revoke  Revoke mission
```

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/identity-service
PORT=3001
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Architecture

```
src/
├── app.ts                      # Express app initialization
├── server.ts                   # Server startup
├── types/                      # TypeScript definitions
│   └── index.ts               # User, Admin, Rescuer types
├── errors/                     # Custom error classes
│   └── index.ts               # IdentityServiceError and variants
├── middleware/                 # Request processing
│   └── requireRole.ts         # Role-based access control
├── config/                     # Configuration & connections
│   └── database.ts            # MongoDB connection
├── modules/                    # Feature modules
│   ├── user/                  # Citizen user management
│   │   ├── user.types.ts
│   │   ├── user.mongo.schema.ts
│   │   ├── user.service.ts
│   │   ├── user.controller.ts
│   │   └── user.routes.ts
│   ├── admin/                 # Admin user management
│   │   ├── admin.controller.ts
│   │   └── admin.routes.ts
│   └── rescuer/               # Rescuer mission management
│       ├── rescuer.service.ts
│       ├── rescuer.controller.ts
│       └── rescuer.routes.ts
├── services/                   # Business logic services
│   ├── auditLogger.ts         # Audit logging service
│   └── auditLog.mongo.schema.ts
└── utils/                      # Utilities
    ├── logger.ts              # Structured logging
    └── validators.ts          # Input validation
```

## Key Principles

> **Admins govern systems.
> SOS Admins govern emergencies.
> Rescuers govern moments.
> Citizens govern themselves.**

1. **Non-Negotiable Authority Rules** - Role hierarchy is enforced at every level
2. **Municipality Isolation** - city_admin and sos_admin cannot cross boundaries
3. **Audit Everything** - Every privileged action is logged immutably
4. **Mission-Based Rescuers** - No persistent accounts, time-limited tokens only
5. **Legal-Grade Compliance** - 2-year audit retention for LGU accountability

## Integration

### With SOS Service

When assigning rescuers to an SOS:

```
SOS Service → POST /rescuer/mission
  → Identity Service issues token
  → SOS Service sends to rescuer via SMS/QR
  → Rescuer uses token to access SOS details
```

### With E-Citizen Service

Citizens register:

```
E-Citizen App → POST /users/register
  → Identity Service creates citizen account
  → Returns municipalityCode-scoped access
```

## License

MIT
