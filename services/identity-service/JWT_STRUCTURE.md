# JWT Structure - Clean Separation Model

## 🔑 Core Principle

> **JWT answers only ONE question:**
> **"Who is this request acting as, RIGHT NOW?"**

Three distinct blocks:
1. **Identity** (optional) - WHO they are if authenticated
2. **Actor** (required) - WHAT context they're acting in NOW
3. **Mission** (optional) - WHAT SOS/rescue operation they're bound to

---

## 📋 Type Definitions

### ActorType (WHO IS ACTING?)
```typescript
export type ActorType =
  | 'USER'         // Authenticated person with identity
  | 'ANON_USER'    // Anonymous citizen (no identity)
  | 'ANON_RESCUER' // Walk-in/volunteer rescuer (no identity, mission-based)
  | 'SYSTEM';      // Internal service-to-service
```

### Identity Claims (OPTIONAL - Only if authenticated)
```typescript
export interface IdentityClaims {
  userId?: string;      // USER-UUID (logged in users only)
  firebaseUid?: string; // Firebase UID (authenticated users only)
  role?: UserRole;      // Role only exists if authenticated
}
```

### Actor Context (REQUIRED - Always present)
```typescript
export interface ActorContext {
  actorType: ActorType;         // What are they acting as?
  cityCode: string;             // Municipality (CALUMPIT, APALIT, etc)
  scopes: string[];             // Resolved permissions for THIS context
}
```

### Mission Context (OPTIONAL - Only for SOS/rescue binding)
```typescript
export interface MissionContext {
  sosId?: string;              // Active SOS incident
  rescuerMissionId?: string;   // RMT ID (mission scope, NOT rescuer identity)
}
```

### Final JWT Payload
```typescript
export interface JwtPayload {
  // Standard JWT
  iss: 'identity.e-citizen';
  aud: 'e-citizen';
  exp: number;
  iat: number;

  // Blocks
  identity?: IdentityClaims;    // Optional - absent = anonymous
  actor: ActorContext;          // Required - always present
  mission?: MissionContext;     // Optional - present only for SOS/rescue
}
```

---

## 🧠 WHY THIS SOLVES CONFUSION

| Problem Before | Fixed By |
|---|---|
| Anon citizen vs anon rescuer confusion | `actor.actorType` is explicit |
| Optional userId guessing | `identity` block exists or not |
| Rescuer identity mixed with mission | `rescuerMissionId` is mission-scoped, not identity |
| Role vs context conflict | Role lives ONLY in `identity`, not duplicated |
| Future expansion | New actor types without breaking JWT |

---

## 🔐 Real-World Examples

### 1️⃣ Anonymous Citizen (SOS Report)
```json
{
  "iss": "identity.e-citizen",
  "aud": "e-citizen",
  "exp": 1735182000,
  "iat": 1735178400,
  
  "identity": null,
  
  "actor": {
    "actorType": "ANON_USER",
    "cityCode": "CALUMPIT",
    "scopes": ["sos:create"]
  }
}
```

**Implementation:**
```typescript
const token = AuthService.generateAnonCitizenToken(
  'CALUMPIT',
  ['sos:create'],
  { sosId: 'SOS-123' }
);
```

---

### 2️⃣ Logged-in Citizen
```json
{
  "iss": "identity.e-citizen",
  "aud": "e-citizen",
  "exp": 1735182000,
  "iat": 1735178400,
  
  "identity": {
    "userId": "USER-9f23",
    "firebaseUid": "firebase-abc",
    "role": "CITIZEN"
  },
  
  "actor": {
    "actorType": "USER",
    "cityCode": "CALUMPIT",
    "scopes": ["sos:create", "sos:view"]
  }
}
```

**Implementation:**
```typescript
const tokenPair = AuthService.generateAuthenticatedUserTokens(
  'USER-9f23',
  'firebase-abc',
  'CITIZEN',
  'CALUMPIT',
  ['sos:create', 'sos:view']
);
```

---

### 3️⃣ Anonymous Rescuer (Mission Token)
```json
{
  "iss": "identity.e-citizen",
  "aud": "e-citizen",
  "exp": 1735182000,
  "iat": 1735178400,
  
  "identity": null,
  
  "actor": {
    "actorType": "ANON_RESCUER",
    "cityCode": "CALUMPIT",
    "scopes": ["rescue:track", "rescue:update"]
  },
  
  "mission": {
    "sosId": "SOS-8891",
    "rescuerMissionId": "RMT-77aa"
  }
}
```

**Implementation:**
```typescript
const token = AuthService.generateAnonRescuerToken(
  'CALUMPIT',
  'SOS-8891',
  'RMT-77aa',
  ['rescue:track', 'rescue:update']
);
```

---

### 4️⃣ Authenticated Rescuer
```json
{
  "iss": "identity.e-citizen",
  "aud": "e-citizen",
  "exp": 1735182000,
  "iat": 1735178400,
  
  "identity": {
    "userId": "USER-rescuer-01",
    "firebaseUid": "firebase-rescuer",
    "role": "RESCUER"
  },
  
  "actor": {
    "actorType": "USER",
    "cityCode": "CALUMPIT",
    "scopes": ["rescue:track", "rescue:update", "sos:view"]
  },
  
  "mission": {
    "sosId": "SOS-8891",
    "rescuerMissionId": "RMT-77aa"
  }
}
```

**Implementation:**
```typescript
const tokenPair = AuthService.generateAuthenticatedUserTokens(
  'USER-rescuer-01',
  'firebase-rescuer',
  'RESCUER',
  'CALUMPIT',
  ['rescue:track', 'rescue:update', 'sos:view'],
  { sosId: 'SOS-8891' }
);
```

---

### 5️⃣ SOS Admin
```json
{
  "iss": "identity.e-citizen",
  "aud": "e-citizen",
  "exp": 1735182000,
  "iat": 1735178400,
  
  "identity": {
    "userId": "ADMIN-001",
    "firebaseUid": "firebase-admin",
    "role": "SOS_ADMIN"
  },
  
  "actor": {
    "actorType": "USER",
    "cityCode": "CALUMPIT",
    "scopes": ["sos:assign", "rescue:bind", "sos:view", "admin:view"]
  }
}
```

---

## 🧩 BFF / Gateway Validation Rules

**NEVER infer role from missing fields. Always check explicitly:**

```typescript
// ✅ CORRECT PATTERN
function getActorInfo(payload: JwtPayload) {
  // First check actor type (always present)
  switch (payload.actor.actorType) {
    case 'ANON_USER':
      // Anonymous citizen - no identity, minimal scopes
      return { isAnonymous: true, role: null, scopes: payload.actor.scopes };
    
    case 'ANON_RESCUER':
      // Anonymous rescuer - no identity, mission-bound
      return { 
        isAnonymous: true, 
        role: null, 
        scopes: payload.actor.scopes,
        sosId: payload.mission?.sosId,
        rescuerMissionId: payload.mission?.rescuerMissionId
      };
    
    case 'USER':
      // Authenticated user - has identity and role
      return { 
        isAnonymous: false, 
        userId: payload.identity!.userId, 
        role: payload.identity!.role,
        scopes: payload.actor.scopes
      };
    
    case 'SYSTEM':
      // Service-to-service
      return { isSystem: true };
  }
}
```

---

## 📝 Migration Notes

### Old vs New (generateTokenPair)

**Old way (still supported for backward compatibility):**
```typescript
AuthService.generateTokenPair(
  userId, 
  firebaseUid, 
  userRole, 
  cityCode, 
  scopes,
  { sosId, rescuerId }
);
```

**New way (recommended):**
```typescript
// Authenticated user
AuthService.generateAuthenticatedUserTokens(
  userId, firebaseUid, userRole, cityCode, scopes, { sosId }
);

// Anonymous citizen
AuthService.generateAnonCitizenToken(cityCode, scopes, { sosId });

// Anonymous rescuer
AuthService.generateAnonRescuerToken(cityCode, sosId, rescuerMissionId, scopes);
```

---

## ✅ Validation Checklist

When implementing JWT validation:

- [ ] Check `payload.actor.actorType` first
- [ ] Then check `payload.identity?.role` if authenticated
- [ ] Then verify `payload.actor.scopes` for permission
- [ ] Only check `payload.mission` if actorType is `ANON_RESCUER` or mission-bound
- [ ] Never assume identity exists based on other fields
- [ ] Never infer actorType from missing fields

---

## 🔐 Security Properties

✅ **Anonymous users cannot forge identity** - No userId in identity block
✅ **Rescuers cannot self-escalate** - Role only in identity block
✅ **Missions are time-bound** - exp claim applies to mission tokens
✅ **Clear audit trail** - Actor type makes logging deterministic
✅ **Future-proof** - New actor types don't break existing logic
