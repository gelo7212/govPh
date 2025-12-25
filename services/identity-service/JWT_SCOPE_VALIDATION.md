# JWT Scope Validation

## Overview

JWT scope validation ensures that users and rescuers have appropriate permissions when tokens are generated. The validation enforces different scope requirements based on the actor type and role.

## Scope Requirements

### By Actor Type

| Actor Type | Scopes Required | Notes |
|---|---|---|
| `USER` (Citizen) | ❌ OPTIONAL | Citizens do not need scopes to create SOS reports |
| `ANON_USER` (Anonymous Citizen) | ❌ OPTIONAL | Anonymous users do not need scopes |
| `RESCUER` | ✅ REQUIRED | Authenticated rescuers must have scopes defining their permissions |
| `ANON_RESCUER` | ✅ REQUIRED | Walk-in/volunteer rescuers must have scopes for mission access |
| `SYSTEM` | ✅ REQUIRED | System-to-system communication requires scopes |

### By User Role (for `USER` actor type)

| Role | Scopes Required | Default Scopes |
|---|---|---|
| `CITIZEN` | ❌ OPTIONAL | None |
| `RESCUER` | ✅ REQUIRED | `['sos:respond', 'location:send', 'message:send']` |
| `APP_ADMIN` | ✅ REQUIRED | `['admin:manage_cities', 'admin:manage_admins', 'sos:view_all', 'rescuer:assign']` |
| `CITY_ADMIN` | ✅ REQUIRED | `['admin:manage_admins', 'sos:view_city', 'rescuer:assign_city']` |
| `SOS_ADMIN` | ✅ REQUIRED | `['sos:view_city', 'rescuer:assign_city']` |

## Implementation

### Using ScopeValidator

The `ScopeValidator` class provides methods to validate and get scopes:

#### Validate Scopes
```typescript
import { ScopeValidator } from '../utils/scopeValidator';

// Validates scopes and throws error if invalid
ScopeValidator.validateScopes(
  'USER',                     // actor type
  ['sos:respond'],           // scopes array
  'RESCUER'                  // optional role
);
```

#### Check if Scopes Required
```typescript
// Returns true if scopes are required for this actor type/role
const required = ScopeValidator.isScopesRequired('RESCUER');
// Returns: true

const required = ScopeValidator.isScopesRequired('USER', 'CITIZEN');
// Returns: false
```

#### Get Default Scopes
```typescript
// Get recommended scopes for a role
const scopes = ScopeValidator.getDefaultScopesForRole('RESCUER');
// Returns: ['sos:respond', 'location:send', 'message:send']

// Get recommended scopes for actor type
const scopes = ScopeValidator.getDefaultScopesForActorType('ANON_RESCUER');
// Returns: ['sos:respond', 'location:send', 'message:send']
```

### Token Generation with Validation

All JWT token generation methods now validate scopes automatically:

```typescript
import { AuthService } from '../services/auth.service';

// ✅ Valid: RESCUER with scopes
AuthService.generateAuthenticatedUserTokens(
  userId,
  firebaseUid,
  'RESCUER',
  cityCode,
  ['sos:respond', 'location:send']  // ✅ Required and provided
);

// ❌ Invalid: RESCUER without scopes
AuthService.generateAuthenticatedUserTokens(
  userId,
  firebaseUid,
  'RESCUER',
  cityCode,
  []  // ❌ Error: Scopes are required for RESCUER
);

// ✅ Valid: CITIZEN without scopes
AuthService.generateAuthenticatedUserTokens(
  userId,
  firebaseUid,
  'CITIZEN',
  cityCode,
  []  // ✅ OK: Scopes are optional for CITIZEN
);

// ✅ Valid: CITIZEN with scopes (optional)
AuthService.generateAuthenticatedUserTokens(
  userId,
  firebaseUid,
  'CITIZEN',
  cityCode,
  ['sos:create']  // ✅ OK: Can include scopes even if optional
);

// Anonymous Citizen - scopes optional
AuthService.generateAnonCitizenToken(
  cityCode,
  []  // ✅ OK: Scopes optional for anonymous citizens
);

// Anonymous Rescuer - scopes required
AuthService.generateAnonRescuerToken(
  cityCode,
  sosId,
  rescuerMissionId,
  ['sos:respond']  // ✅ Required for ANON_RESCUER
);
```

## Error Handling

When scope validation fails, the auth service throws an error:

```typescript
try {
  // This will throw an error because RESCUER requires scopes
  AuthService.generateAuthenticatedUserTokens(
    userId,
    firebaseUid,
    'RESCUER',
    cityCode,
    []  // Missing required scopes
  );
} catch (error) {
  console.error(error.message);
  // Output: "Scopes are required for USER with role RESCUER"
}
```

## Recommended Scopes

### Citizen Scopes (optional but recommended)
```typescript
const citizenScopes = [
  'sos:create',              // Create SOS reports
  'sos:update_own',          // Update own SOS
  'location:send',           // Send location updates
  'message:send'             // Send messages
];
```

### Rescuer Scopes (required)
```typescript
const rescuerScopes = [
  'sos:respond',             // Respond to SOS
  'location:send',           // Send location
  'message:send',            // Send messages
  'status:update'            // Update status
];
```

### Admin Scopes (required)
```typescript
const appAdminScopes = [
  'admin:manage_cities',     // Manage LGU cities
  'admin:manage_admins',     // Create/suspend admins
  'sos:view_all',            // View all SOS
  'rescuer:assign'           // Assign rescuers
];

const cityAdminScopes = [
  'admin:manage_admins',     // Manage city admins
  'sos:view_city',           // View city SOS
  'rescuer:assign_city'      // Assign city rescuers
];

const sosAdminScopes = [
  'sos:view_city',           // View city SOS
  'rescuer:assign_city',     // Assign city rescuers
  'sos:admin_notes'          // Add admin notes
];
```

## Migration Guide

If you're updating existing code:

### Before (No Validation)
```typescript
AuthService.generateAuthenticatedUserTokens(
  userId,
  firebaseUid,
  'RESCUER',
  cityCode,
  []  // No scopes - this is now invalid!
);
```

### After (With Validation)
```typescript
// Option 1: Explicitly provide scopes
AuthService.generateAuthenticatedUserTokens(
  userId,
  firebaseUid,
  'RESCUER',
  cityCode,
  ['sos:respond', 'location:send']
);

// Option 2: Use helper to get default scopes
const defaultScopes = ScopeValidator.getDefaultScopesForRole('RESCUER');
AuthService.generateAuthenticatedUserTokens(
  userId,
  firebaseUid,
  'RESCUER',
  cityCode,
  defaultScopes
);
```

## Compliance Checklist

When generating JWT tokens:

- [ ] **Citizens**: Can generate with or without scopes
- [ ] **Rescuers**: Must include required scopes
- [ ] **Admins**: Must include appropriate admin scopes
- [ ] **Anonymous Users**: Scopes not required
- [ ] **Walk-in Rescuers (ANON_RESCUER)**: Must include scopes
- [ ] All scopes are non-empty strings
- [ ] Scopes array is not empty (if required)
