# Role-Based Access Control (RBAC) Specification

## Authorization Model

The Identity Service implements a **Role-Hierarchy Authorization Model** with **Municipality-Scoped Access**.

## Role Hierarchy

```
        APP_ADMIN (System-wide)
           │
           ├─ CITY_ADMIN (Municipality-scoped)
           │     │
           │     └─ SOS_ADMIN (Emergency ops, municipality-scoped)
           │
           └─ CITIZEN (Personal scope)
```

**Key Principle:** Each role governs a specific domain. You cannot escalate.

## Role Definitions

### 👑 APP_ADMIN

**Scope:** System-wide (all municipalities)

**Responsibilities:**
- Govern the entire platform
- Create city_admin and sos_admin
- View all municipalities and users
- Access national-level audit logs
- System administration

**Cannot Do:**
- Respond to SOS calls
- Create SOS incidents
- Act as a rescuer
- Delegate authority (admins create themselves down the chain)

**Example:** National e-Government director

---

### 🏛️ CITY_ADMIN

**Scope:** One municipality (immutable)

**Responsibilities:**
- Govern a single municipality (city/municipality)
- Create sos_admin in their municipality
- Manage users in their municipality
- Suspend/activate users
- Assign rescuers to SOS
- View audit logs for their municipality
- Coordinate emergency response

**Cannot Do:**
- Access other municipalities
- Create city_admin (only app_admin can)
- Respond to SOS (only rescuers do)
- Create users directly (citizens self-register)

**Example:** Mayor's IT officer, DILG representative

---

### 🚨 SOS_ADMIN

**Scope:** One municipality (immutable), emergency operations only

**Responsibilities:**
- Manage emergency operations
- Create rescuer mission tokens
- Revoke rescuer missions
- Coordinate responders
- View SOS-related data in their municipality
- View audit logs for emergency operations

**Cannot Do:**
- Access other municipalities
- Create other admins (only city_admin can)
- Manage non-emergency users
- Suspend/activate accounts
- Respond to SOS (only rescuers do)

**Example:** MDRRMO Chief, Emergency Operations Center manager

---

### 👤 CITIZEN

**Scope:** Personal (self)

**Responsibilities:**
- Self-register
- View own profile
- Create SOS incidents
- Provide information during emergencies

**Cannot Do:**
- Create other users
- Manage any admins
- Respond to SOS
- Access other citizen data

**Example:** Regular public user

---

### 🚑 RESCUER (Mission-Based)

**Scope:** Single SOS incident, time-limited

**Characteristics:**
- NOT a persistent user
- Temporary mission token (default: 60 minutes)
- Single-use scope (sosId + municipalityCode)
- Hard-coded permissions
- No login required

**Permissions:**
- `view_sos` - Read SOS details
- `update_status` - Update incident status
- `send_location` - Send GPS coordinates
- `send_message` - Send text updates

**Cannot Do:**
- View other SOS incidents
- Create SOS incidents
- Manage users
- Escalate permissions
- Persist beyond token expiry

**Example:** Firefighter, paramedic, police officer responding to 911

---

## Access Control Matrix

### User Management

| Operation              | app_admin | city_admin | sos_admin | citizen | rescuer |
| ---------------------- | --------- | ---------- | --------- | ------- | ------- |
| Register citizen       | ❌         | ❌         | ❌         | ✅       | ❌       |
| Create city_admin      | ✅         | ❌         | ❌         | ❌       | ❌       |
| Create sos_admin       | ✅         | ✅ (own)   | ❌         | ❌       | ❌       |
| View own profile       | ✅         | ✅         | ✅         | ✅       | ❌       |
| View other users       | ✅ (all)   | ✅ (own)   | ✅ (own)   | ❌       | ❌       |
| Suspend user           | ✅         | ✅ (own)   | ❌         | ❌       | ❌       |
| Activate user          | ✅         | ✅ (own)   | ❌         | ❌       | ❌       |
| Archive user           | ✅         | ✅ (own)   | ❌         | ❌       | ❌       |

### Emergency Operations

| Operation              | app_admin | city_admin | sos_admin | citizen | rescuer |
| ---------------------- | --------- | ---------- | --------- | ------- | ------- |
| Create SOS             | ❌         | ❌         | ❌         | ✅       | ❌       |
| View all SOS           | ✅         | ✅ (own)   | ✅ (own)   | ❌       | ❌       |
| View single SOS        | ✅         | ✅ (own)   | ✅ (own)   | ❌       | ✅ *      |
| Update SOS status      | ❌         | ❌         | ❌         | ❌       | ✅ *      |
| Create rescuer mission | ❌         | ✅ (own)   | ✅ (own)   | ❌       | ❌       |
| Revoke rescuer mission | ❌         | ✅ (own)   | ✅ (own)   | ❌       | ❌       |
| Respond to SOS         | ❌         | ❌         | ❌         | ❌       | ✅ *      |

\* Only within mission scope (sosId + 60-minute window)

### Audit & Compliance

| Operation              | app_admin | city_admin | sos_admin | citizen | rescuer |
| ---------------------- | --------- | ---------- | --------- | ------- | ------- |
| View all audit logs    | ✅         | ❌         | ❌         | ❌       | ❌       |
| View own municipality  | ✅         | ✅ (own)   | ✅ (own)   | ❌       | ❌       |
| Export audit logs      | ✅         | ✅ (own)   | ✅ (own)   | ❌       | ❌       |
| Delete audit logs      | ❌         | ❌         | ❌         | ❌       | ❌       |

---

## Authority Rules (Non-Negotiable)

### Who Can Create Whom

```
app_admin → city_admin, sos_admin
city_admin → sos_admin (same municipality only)
sos_admin → (no one)
citizen → (no one)
```

### Key Constraints

1. **No Self-Elevation** - Cannot create own role or higher
2. **No Cross-Municipality** - city_admin/sos_admin cannot manage other municipalities
3. **No Sideways Movement** - Cannot create sister roles (e.g., sos_admin can't create city_admin)
4. **Immutable Municipality** - municipalityCode cannot be changed after admin creation
5. **Citizen Auto-Role** - Citizens cannot manually assign themselves a role

### Enforcement Examples

```ts
// ✅ ALLOWED
app_admin → create city_admin for CALUMPIT
city_admin (CALUMPIT) → create sos_admin for CALUMPIT
app_admin → create sos_admin directly

// ❌ NOT ALLOWED
city_admin (CALUMPIT) → create city_admin (no same-level)
city_admin (CALUMPIT) → create sos_admin for MANILA (cross-municipality)
sos_admin → create city_admin (no escalation)
sos_admin → create user (no direct user creation)
citizen → create any user (no escalation)
```

---

## Municipality Scoping

### Rules

1. **app_admin** can access all municipalities (no scoping)
2. **city_admin** is locked to ONE municipality at creation
3. **sos_admin** is locked to ONE municipality at creation
4. **citizen** can opt into a municipality (optional)
5. **rescuer** inherits municipality from mission

### Enforcement

```ts
// ✅ Allowed
city_admin (CALUMPIT) reads users → only sees CALUMPIT users
sos_admin (CALUMPIT) creates mission → in CALUMPIT only
app_admin reads users → sees all municipalities

// ❌ Blocked
city_admin (CALUMPIT) tries to read MANILA users → FORBIDDEN
sos_admin (CALUMPIT) tries to create admin for MANILA → FORBIDDEN
city_admin creates admin without municipalityCode → VALIDATION_ERROR
```

### Database Queries

```ts
// app_admin: no filter
collection.find({})

// city_admin/sos_admin: filter by municipality
collection.find({ municipalityCode: req.user.municipalityCode })

// citizen: personal only
collection.find({ _id: req.user.userId })
```

---

## Permission Inheritance

Roles do NOT inherit permissions from parent roles. Instead:

- Each role has explicitly defined permissions
- Higher roles have MORE permissions (not inherited, just overlapping)
- This prevents accidental over-privilege

```
app_admin:     {view_all, create_city, create_sos, suspend_user}
city_admin:    {view_own, create_sos, suspend_user}
sos_admin:     {view_sos, create_mission, revoke_mission}
citizen:       {create_sos, view_own}
rescuer:       {view_sos*, send_location*, send_message*} (* = mission-scoped)
```

---

## Audit Logging for RBAC

Every authorization decision is logged:

```json
{
  "id": "audit_1234567890",
  "timestamp": "2024-01-15T10:30:00Z",
  "actorUserId": "admin_789012",
  "actorRole": "city_admin",
  "action": "create_sos_admin",
  "municipalityCode": "CALUMPIT",
  "targetUserId": "admin_456789",
  "targetRole": "sos_admin",
  "metadata": {
    "success": true,
    "requestIp": "192.168.1.1"
  }
}
```

### Audited Actions

- `create_city_admin` - Created city_admin
- `create_sos_admin` - Created sos_admin
- `suspend_user` - Suspended account
- `activate_user` - Activated account
- `archive_user` - Archived account
- `create_rescuer_mission` - Issued rescuer token
- `revoke_rescuer_mission` - Revoked rescuer token
- `view_users` - Listed users
- `view_audit_logs` - Accessed audit trail

---

## Error Codes for RBAC Violations

| Code                       | HTTP | Meaning                                    |
| -------------------------- | ---- | ------------------------------------------ |
| UNAUTHORIZED               | 401  | No/invalid authentication token            |
| INVALID_TOKEN              | 401  | Token malformed or expired                 |
| INSUFFICIENT_PERMISSION    | 403  | Role doesn't have required permission      |
| FORBIDDEN                  | 403  | Action denied (policy-based)               |
| MUNICIPALITY_ACCESS_DENIED | 403  | Trying to access other municipality        |
| CANNOT_CREATE_ADMIN        | 403  | Role cannot create that admin type         |

---

## Testing RBAC

### Unit Tests

```ts
// Authority rules
assert(AUTHORITY_RULES['app_admin'].includes('city_admin'))
assert(!AUTHORITY_RULES['sos_admin'].includes('citizen'))

// Permission matrix
assert(hasPermission('app_admin', 'manage_cities'))
assert(!hasPermission('citizen', 'manage_cities'))
```

### Integration Tests

```ts
// city_admin cannot create city_admin
POST /admin/users {role: city_admin} as city_admin
→ 403 CANNOT_CREATE_ADMIN

// city_admin cannot see other municipality
GET /admin/users?municipalityCode=OTHER as city_admin (CALUMPIT)
→ 403 MUNICIPALITY_ACCESS_DENIED

// sos_admin can create rescuer mission
POST /rescuer/mission {sosId} as sos_admin
→ 201 Created
```

---

## Future Enhancements

1. **Fine-Grained Permissions** - Move from role-based to permission-based
2. **Attribute-Based Access Control (ABAC)** - Add conditions (e.g., "can only access SOS after 9am")
3. **Delegation** - Allow admins to delegate specific tasks
4. **Time-Limited Escalation** - Temporary elevation for emergency response
5. **Multi-Role Users** - Users with multiple roles (e.g., city_admin + sos_admin)

---

## Summary

| Role      | Scope              | Creates              | Can Do                                   |
| --------- | ------------------ | -------------------- | ---------------------------------------- |
| app_admin | System-wide        | city_admin, sos_admin | View all, create admins, suspend users   |
| city_admin| Municipality       | sos_admin            | Manage own municipality, assign rescuers |
| sos_admin | Municipality       | (none)               | Emergency ops only, issue rescuer tokens |
| citizen   | Personal           | (none)               | Self-register, create SOS                |
| rescuer   | SOS mission (1 hr)  | (none)               | Respond to SOS (mission scope only)      |

**Golden Rule:** *Authority flows down, not sideways. Rescuers are temporary. Admins are permanent.*
