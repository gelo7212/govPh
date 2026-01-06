# Anonymous Rescuer Feature Specification
## SOS Service Implementation Guide

**Status:** In Development  
**Version:** 1.0  
**Last Updated:** January 6, 2026  
**Target Sprint:** Q1 2026

---

## Executive Summary

This document provides technical specifications and implementation guidelines for the **Anonymous Rescuer Feature**, enabling unregistered users to view and join active SOS incidents, track locations in real-time, and participate in rescue operations.

### Key Objectives
- ✅ Allow anonymous users to view all active SOS incidents
- ✅ Enable anonymous users to join as rescuers without registration
- ✅ Provide real-time location updates for incidents
- ✅ Maintain audit trail of all participants
- ✅ Ensure data privacy for anonymous users
- ✅ Scale to handle concurrent anonymous participants

---

## Table of Contents
1. [Feature Overview](#feature-overview)
2. [Architecture & System Design](#architecture--system-design)
3. [Data Schema Updates](#data-schema-updates)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Database Changes](#database-changes)
6. [API Implementation Details](#api-implementation-details)
7. [WebSocket Integration](#websocket-integration)
8. [Authentication & Security](#authentication--security)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Plan](#deployment-plan)

---

## Feature Overview

### User Stories

#### 1. **Anonymous User Discovery**
```
As an anonymous rescuer
I want to see all active SOS incidents in my area
So that I can quickly respond to emergencies
```

**Acceptance Criteria:**
- Display active SOS list within 5km radius
- Show incident type, time, and location
- Update automatically every 10 seconds
- No registration required

#### 2. **Join as Rescuer**
```
As an anonymous rescuer
I want to join an active SOS incident
So that I can participate in the rescue operation
```

**Acceptance Criteria:**
- Join with single tap/click
- Automatic device ID assignment
- Real-time confirmation
- Appear in active participants list

#### 3. **Real-Time Location Tracking**
```
As an anonymous rescuer or incident reporter
I want to share my real-time location
So that other responders can find me
```

**Acceptance Criteria:**
- Track location with high accuracy
- Update every 30 seconds or on significant movement (>50m)
- Stop tracking when incident closed
- GPS permission handling

#### 4. **View Incident Details**
```
As an anonymous rescuer
I want to see detailed information about a SOS
So that I understand the emergency situation
```

**Acceptance Criteria:**
- Display all incident information
- Show active participants
- View location history
- See message history

#### 5. **Real-Time Notifications**
```
As an anonymous rescuer
I want to receive real-time updates
So that I'm always informed of incident status
```

**Acceptance Criteria:**
- New SOS notifications
- Participant join notifications
- Location updates
- Status change notifications

---

## Architecture & System Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Web/Mobile)                    │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Anonymous User  │         │  Registered User │          │
│  │   (No Login)     │         │  (Logged In)     │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
└───────────┼─────────────────────────────┼──────────────────┘
            │                             │
            └─────────────┬───────────────┘
                          │
         ┌────────────────▼──────────────────┐
         │    BFF (Backend For Frontend)     │
         │  ┌──────────────────────────────┐ │
         │  │  Auth & Device ID Management │ │
         │  │  Request Validation          │ │
         │  │  Rate Limiting               │ │
         │  └──────────────────────────────┘ │
         └────────────────┬──────────────────┘
                          │
    ┌─────────────────────┼──────────────────────┐
    │                     │                      │
    ▼                     ▼                      ▼
┌─────────────┐   ┌──────────────┐    ┌────────────────┐
│ SOS Service │◄──│Real-time Svc │────│ Geo-Service    │
│             │   │(WebSocket)   │    │(Spatial Queries│
│ ┌─────────┐ │   └──────────────┘    └────────────────┘
│ │ MongoDB │ │
│ └─────────┘ │
└─────────────┘
```

### Service Components

| Component | Responsibility |
|-----------|-----------------|
| **SOS Service** | Core SOS management, participant tracking, location updates |
| **Real-time Service** | WebSocket connections, event broadcasting, live updates |
| **Geo-Service** | Spatial queries, location-based filtering |
| **BFF** | Anonymous authentication, device ID management, rate limiting |
| **MongoDB** | Data persistence with geospatial indexes |

---

## Data Schema Updates

### 1. **SOS Collection Updates**

```typescript
// Add these fields to SOS schema
interface SOSEnhancements {
  // Anonymous creator tracking
  isAnonymous: boolean;                    // true if created by anon user
  creatorDeviceId?: string;                // Device ID of anon creator
  
  // Incident visibility
  visibility: 'PUBLIC' | 'RESTRICTED';    // PUBLIC for anon viewing
  
  // Location history optimization
  locationSnapshot?: {
    coordinates: [number, number];
    timestamp: Date;
    accuracy: number;
  };
}
```

**Migration:**
```typescript
// Add fields with default values
db.sos.updateMany(
  {},
  {
    $set: {
      isAnonymous: false,
      visibility: 'PUBLIC'
    }
  }
);
```

### 2. **Participants Collection**

```typescript
interface ParticipantEnhancements {
  // Anon rescuer tracking
  isAnonymous: boolean;
  deviceId?: string;                       // Unique device identifier
  
  // Participation metrics
  participationDuration?: number;          // Seconds active in SOS
  
  // Contact info (optional for anon)
  phoneNumber?: string;
  name?: string;
}
```

### 3. **New Locations Collection**

```typescript
interface LocationDocument {
  _id: ObjectId;
  sosId: ObjectId;                         // Reference to SOS
  cityId: ObjectId;                        // City reference
  location: {
    type: 'Point';
    coordinates: [number, number];         // [lng, lat]
  };
  accuracy: number;                        // GPS accuracy in meters
  speed?: number;                          // m/s
  heading?: number;                        // degrees
  timestamp: Date;
  createdAt: Date;                         // When inserted
}
```

**Indexes:**
```javascript
// Geospatial index for location queries
db.locations.createIndex({
  'location': '2dsphere'
});

// Compound index for SOS location queries
db.locations.createIndex({
  'sosId': 1,
  'timestamp': -1
});

// TTL index to auto-delete old locations (30 days)
db.locations.createIndex({
  'timestamp': 1
}, { expireAfterSeconds: 2592000 });
```

### 4. **Device Management Collection** (New)

```typescript
interface DeviceRecord {
  _id: ObjectId;
  deviceId: string;                        // Unique device ID
  userId?: ObjectId;                       // Linked user (if converted)
  lastActivityAt: Date;
  createdAt: Date;
  metadata: {
    os: string;                            // iOS, Android, Web
    appVersion: string;
    locale: string;
  };
  flags: {
    isBlocked: boolean;
    participationCount: number;
    totalParticipationTime: number;
  };
}
```

**Indexes:**
```javascript
db.devices.createIndex({
  'deviceId': 1
}, { unique: true });

db.devices.createIndex({
  'userId': 1
});

db.devices.createIndex({
  'lastActivityAt': -1
});
```

---

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)

**Deliverables:**
- [ ] Device ID generation and validation
- [ ] Anonymous authentication flow in BFF
- [ ] Database schema migrations
- [ ] Updated SOS endpoints for anonymous access

**Files to Create/Modify:**
```
src/
├── modules/
│   ├── sos/
│   │   ├── sos.controller.ts (MODIFY - add anon checks)
│   │   ├── sos.model.ts (MODIFY - add fields)
│   │   ├── sos.mongo.schema.ts (MODIFY - add indexes)
│   │   └── sos.repository.ts (MODIFY - add queries)
│   └── sos_participants/
│       ├── participant.controller.ts (MODIFY)
│       ├── participant.model.ts (MODIFY)
│       └── participant.service.ts (MODIFY)
├── config/
│   └── database.ts (MODIFY - add indexes)
└── middleware/
    └── anonAuth.ts (CREATE - anonymous middleware)
```

### Phase 2: Location Tracking (Week 3)

**Deliverables:**
- [ ] Location update endpoint optimization
- [ ] Location history queries
- [ ] Geospatial queries for distance filtering
- [ ] WebSocket location broadcast

**Files to Create/Modify:**
```
src/
├── modules/
│   └── tracking/
│       ├── location.controller.ts (MODIFY)
│       ├── location.service.ts (MODIFY)
│       ├── location.mongo.schema.ts (MODIFY - add geospatial index)
│       └── location.repository.ts (MODIFY - add queries)
└── services/
    └── sos.realtime.client.ts (MODIFY - location events)
```

### Phase 3: Real-Time Features (Week 4)

**Deliverables:**
- [ ] WebSocket namespace setup for anon users
- [ ] Event broadcasting (SOS updates, participants, locations)
- [ ] Connection management
- [ ] Error handling and reconnection

**Files to Create/Modify:**
```
src/
├── socket/
│   ├── handlers/ (CREATE - event handlers)
│   │   ├── sosHandler.ts
│   │   ├── locationHandler.ts
│   │   └── participantHandler.ts
│   ├── middleware/
│   │   └── authSocket.ts (MODIFY)
│   └── index.ts (MODIFY)
└── modules/
    └── sos/
        └── sos.controller.ts (MODIFY - emit events)
```

### Phase 4: Testing & Optimization (Week 5)

**Deliverables:**
- [ ] Unit tests for all new functions
- [ ] Integration tests for anonymous flow
- [ ] Load testing with concurrent users
- [ ] Performance optimization
- [ ] Security audit

---

## Database Changes

### Migrations

#### Migration 1: Update SOS Schema

```typescript
// migration.ts
import { SOSModel } from './modules/sos';

export async function migrateSOSSchema() {
  // Add new fields
  await SOSModel.updateMany(
    { isAnonymous: { $exists: false } },
    {
      $set: {
        isAnonymous: false,
        visibility: 'PUBLIC',
        locationSnapshot: null
      }
    }
  );

  // Create compound index
  await SOSModel.collection.createIndex({
    cityId: 1,
    status: 1,
    createdAt: -1
  });

  // Create geospatial index for location-based queries
  await SOSModel.collection.createIndex({
    'lastKnownLocation': '2dsphere'
  });

  console.log('✓ SOS schema migration complete');
}
```

#### Migration 2: Create Locations Collection

```typescript
export async function createLocationsCollection() {
  // Create collection
  const db = mongoose.connection.db;
  if (!await db.listCollections({ name: 'locations' }).toArray().length) {
    await db.createCollection('locations');
  }

  // Create indexes
  const locationsCollection = db.collection('locations');
  
  await locationsCollection.createIndex({
    'location': '2dsphere'
  });

  await locationsCollection.createIndex({
    'sosId': 1,
    'timestamp': -1
  });

  await locationsCollection.createIndex({
    'timestamp': 1
  }, { expireAfterSeconds: 2592000 });

  console.log('✓ Locations collection created');
}
```

#### Migration 3: Create Device Management

```typescript
export async function createDeviceManagement() {
  // Create collection
  const db = mongoose.connection.db;
  if (!await db.listCollections({ name: 'devices' }).toArray().length) {
    await db.createCollection('devices');
  }

  // Create indexes
  const devicesCollection = db.collection('devices');

  await devicesCollection.createIndex({
    'deviceId': 1
  }, { unique: true });

  await devicesCollection.createIndex({
    'userId': 1
  });

  console.log('✓ Device management collection created');
}
```

---

## API Implementation Details

### New Controller Methods

#### SosParticipantController Enhancements

```typescript
export class SosParticipantController {
  // ... existing methods ...

  /**
   * Get participation statistics
   * GET /participants/:sosId/stats
   */
  async getParticipationStats(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;

      if (!sosId) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: sosId'
        });
        return;
      }

      const stats = await this.service.getParticipationStats(sosId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching participation statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get anonymous participants count
   * GET /participants/:sosId/anonymous/count
   */
  async getAnonymousParticipantCount(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { sosId } = req.params;

      if (!sosId) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: sosId'
        });
        return;
      }

      const count = await this.service.getAnonymousParticipantCount(sosId);

      res.status(200).json({
        success: true,
        data: { anonymousCount: count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching anonymous participant count',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
```

### New Service Methods

```typescript
// participant.service.ts
export class SosParticipantService {
  async getParticipationStats(sosId: string): Promise<{
    totalParticipants: number;
    activeParticipants: number;
    registeredRescuers: number;
    anonymousRescuers: number;
    averageParticipationTime: number;
  }> {
    const participants = await this.repository.findAll(sosId);
    
    const active = participants.filter(p => p.status === 'ACTIVE');
    const registered = participants.filter(p => !p.isAnonymous);
    const anonymous = participants.filter(p => p.isAnonymous);

    const avgTime = participants.reduce((sum, p) => {
      const duration = p.leftAt 
        ? (p.leftAt.getTime() - p.joinedAt.getTime()) / 1000
        : (new Date().getTime() - p.joinedAt.getTime()) / 1000;
      return sum + duration;
    }, 0) / participants.length;

    return {
      totalParticipants: participants.length,
      activeParticipants: active.length,
      registeredRescuers: registered.length,
      anonymousRescuers: anonymous.length,
      averageParticipationTime: Math.round(avgTime)
    };
  }

  async getAnonymousParticipantCount(sosId: string): Promise<number> {
    return await this.repository.countAnonymous(sosId);
  }
}
```

---

## WebSocket Integration

### WebSocket Namespace Configuration

```typescript
// socket/index.ts
import { Socket, Server as SocketIOServer } from 'socket.io';
import { verifySocketAuth } from './middleware/authSocket';

export function setupSocketIO(io: SocketIOServer) {
  // Main namespace for SOS updates
  const sosNamespace = io.of('/sos');

  sosNamespace.use(async (socket, next) => {
    try {
      const authenticated = await verifySocketAuth(socket);
      if (!authenticated) {
        throw new Error('Authentication failed');
      }
      next();
    } catch (error) {
      next(error);
    }
  });

  // Connection handling
  sosNamespace.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join SOS-specific room
    socket.on('join:sos', (sosId: string) => {
      socket.join(`sos-${sosId}`);
      console.log(`User joined SOS room: sos-${sosId}`);
    });

    // Leave SOS room
    socket.on('leave:sos', (sosId: string) => {
      socket.leave(`sos-${sosId}`);
      console.log(`User left SOS room: sos-${sosId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return sosNamespace;
}
```

### Event Broadcasting

```typescript
// services/socketEmitter.ts
import { Server as SocketIOServer } from 'socket.io';

export class SocketEmitter {
  constructor(private io: SocketIOServer) {}

  /**
   * Broadcast SOS update to all viewers
   */
  broadcastSOSUpdate(sosId: string, data: any) {
    this.io.of('/sos').to(`sos-${sosId}`).emit('sos:updated', {
      sosId,
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast new participant join
   */
  broadcastParticipantJoined(sosId: string, participant: any) {
    this.io.of('/sos').to(`sos-${sosId}`).emit('participant:joined', {
      sosId,
      ...participant,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast location update
   */
  broadcastLocationUpdate(sosId: string, location: any) {
    this.io.of('/sos').to(`sos-${sosId}`).emit('location:updated', {
      sosId,
      ...location,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast SOS closed
   */
  broadcastSOSClosed(sosId: string, data: any) {
    this.io.of('/sos').to(`sos-${sosId}`).emit('sos:closed', {
      sosId,
      ...data,
      timestamp: new Date()
    });
  }
}
```

---

## Authentication & Security

### Anonymous Authentication Flow

```typescript
// middleware/anonAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export async function anonAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const deviceId = req.headers['x-device-id'] as string;

    if (!token && !deviceId) {
      return res.status(401).json({
        success: false,
        message: 'Missing authentication token or device ID'
      });
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = {
          id: decoded.id,
          deviceId: decoded.deviceId,
          actor: decoded.actor,
          cityId: decoded.cityId,
          role: decoded.role || 'ANON'
        };
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
    } else if (deviceId) {
      // Anonymous access via device ID
      req.user = {
        id: deviceId,
        deviceId,
        actor: { type: 'ANON', deviceId },
        cityId: req.body.cityId || req.query.cityId || '',
        role: 'ANON'
      };

      // Track device activity
      await trackDeviceActivity(deviceId, req);
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function trackDeviceActivity(deviceId: string, req: Request) {
  // Optional: Store device activity for analytics
  console.log(`Device activity: ${deviceId}`);
}
```

### Rate Limiting for Anonymous Users

```typescript
// middleware/rateLimitAnon.ts
import rateLimit from 'express-rate-limit';

export const anonLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 minutes
  max: 100,                        // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use device ID if available, otherwise IP address
    return (req.headers['x-device-id'] as string) || req.ip;
  }
});

export const sosCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,        // 1 hour
  max: 5,                           // Max 5 SOS creations per hour
  message: 'You can create maximum 5 SOS requests per hour',
  skipSuccessfulRequests: true
});
```

### Input Validation

```typescript
// utils/validators.ts - Add/Update

export const createSOSSchema = Joi.object({
  type: Joi.string()
    .valid('FIRE', 'MEDICAL', 'ACCIDENT', 'CRIME', 'DISASTER', 'ANONYMOUS')
    .required(),
  message: Joi.string()
    .min(10)
    .max(500)
    .required(),
  silent: Joi.boolean().default(false),
  location: Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required(),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
  }).required(),
  address: Joi.object({
    city: Joi.string().required(),
    barangay: Joi.string().required()
  }).required()
});

export const deviceIdSchema = Joi.object({
  deviceId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .required()
});

export const joinSOSSchema = Joi.object({
  userType: Joi.string()
    .valid('CITIZEN', 'RESCUER', 'ANON_RESCUER', 'ADMIN')
    .required(),
  userId: Joi.string()
    .required()
});
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/unit/participant.service.spec.ts
import { SosParticipantService } from '../src/modules/sos_participants/participant.service';
import { SosParticipantRepository } from '../src/modules/sos_participants/participant.repository';

describe('SosParticipantService - Anonymous Rescuer', () => {
  let service: SosParticipantService;
  let repository: jest.Mocked<SosParticipantRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      countAnonymous: jest.fn()
    } as any;
    service = new SosParticipantService(repository);
  });

  describe('joinSos', () => {
    it('should allow anonymous rescuer to join', async () => {
      const sosId = 'sos-123';
      const deviceId = 'device-456';

      repository.create.mockResolvedValue({
        id: 'participant-1',
        sosId,
        userId: deviceId,
        userType: 'ANON_RESCUER',
        status: 'ACTIVE',
        joinedAt: new Date()
      } as any);

      const result = await service.joinSos(
        sosId,
        'ANON_RESCUER',
        deviceId
      );

      expect(result.userType).toBe('ANON_RESCUER');
      expect(result.status).toBe('ACTIVE');
      expect(repository.create).toHaveBeenCalledWith({
        sosId,
        userId: deviceId,
        userType: 'ANON_RESCUER',
        status: 'ACTIVE',
        joinedAt: expect.any(Date)
      });
    });

    it('should prevent duplicate joins', async () => {
      repository.findAll.mockResolvedValue([
        {
          id: 'participant-1',
          userId: 'device-456',
          status: 'ACTIVE'
        }
      ] as any);

      await expect(
        service.joinSos('sos-123', 'ANON_RESCUER', 'device-456')
      ).rejects.toThrow('User already joined this SOS');
    });
  });

  describe('getAnonymousParticipantCount', () => {
    it('should count anonymous participants', async () => {
      repository.countAnonymous.mockResolvedValue(3);

      const count = await service.getAnonymousParticipantCount('sos-123');

      expect(count).toBe(3);
      expect(repository.countAnonymous).toHaveBeenCalledWith('sos-123');
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/anon-rescuer.integration.spec.ts
import request from 'supertest';
import { app } from '../src/app';
import { SOSModel } from '../src/modules/sos';
import { ParticipantModel } from '../src/modules/sos_participants';

describe('Anonymous Rescuer Integration Tests', () => {
  let sosId: string;
  const deviceId = 'device-test-12345';

  beforeAll(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('View Active SOS', () => {
    it('should allow anonymous user to view active SOS', async () => {
      // Create test SOS
      const sos = await SOSModel.create({
        sosNo: 'SOS-TEST-001',
        type: 'MEDICAL',
        message: 'Emergency medical attention needed',
        status: 'ACTIVE',
        cityId: 'city-123',
        lastKnownLocation: {
          type: 'Point',
          coordinates: [120.9842, 14.5995]
        }
      });
      sosId = sos._id.toString();

      const response = await request(app)
        .get('/api/v1/sos')
        .set('X-Device-ID', deviceId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0].sosNo).toBe('SOS-TEST-001');
    });
  });

  describe('Join SOS', () => {
    it('should allow anonymous rescuer to join active SOS', async () => {
      const sos = await SOSModel.create({
        sosNo: 'SOS-TEST-002',
        type: 'FIRE',
        message: 'Building fire',
        status: 'ACTIVE',
        cityId: 'city-123',
        lastKnownLocation: {
          type: 'Point',
          coordinates: [120.9842, 14.5995]
        }
      });
      sosId = sos._id.toString();

      const response = await request(app)
        .post(`/api/v1/sos/${sosId}/participants/join`)
        .set('X-Device-ID', deviceId)
        .send({
          userType: 'ANON_RESCUER',
          userId: deviceId
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userType).toBe('ANON_RESCUER');
      expect(response.body.data.status).toBe('ACTIVE');

      // Verify in database
      const participant = await ParticipantModel.findById(response.body.data.id);
      expect(participant?.userType).toBe('ANON_RESCUER');
    });
  });

  describe('Get Active Participants', () => {
    it('should include anonymous participants in list', async () => {
      const sos = await SOSModel.create({
        sosNo: 'SOS-TEST-003',
        type: 'ACCIDENT',
        message: 'Traffic accident',
        status: 'ACTIVE',
        cityId: 'city-123',
        lastKnownLocation: {
          type: 'Point',
          coordinates: [120.9842, 14.5995]
        }
      });
      sosId = sos._id.toString();

      // Join as anonymous
      await ParticipantModel.create({
        sosId: sos._id,
        userId: deviceId,
        userType: 'ANON_RESCUER',
        status: 'ACTIVE',
        joinedAt: new Date()
      });

      const response = await request(app)
        .get(`/api/v1/sos/${sosId}/participants/active`)
        .set('X-Device-ID', deviceId)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].userType).toBe('ANON_RESCUER');
    });
  });
});
```

### Load Testing

```typescript
// tests/load/anon-rescuer.load.ts
import autocannon from 'autocannon';

async function runLoadTest() {
  const result = await autocannon({
    url: 'http://localhost:3000/api/v1/sos',
    connections: 100,           // 100 concurrent connections
    duration: 60,               // 60 seconds
    requests: [
      {
        method: 'GET',
        path: '/api/v1/sos?status=ACTIVE',
        headers: {
          'X-Device-ID': 'device-${counter}'
        }
      }
    ]
  });

  console.log('Load Test Results:');
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency: ${result.latency.mean}ms`);
  console.log(`Throughput: ${result.throughput.average} bytes/sec`);
}

runLoadTest();
```

---

## Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing (unit, integration, load)
- [ ] Database migrations tested in staging
- [ ] WebSocket connections verified
- [ ] Security audit completed
- [ ] Performance benchmarks met (< 200ms response time)
- [ ] Documentation updated
- [ ] Monitoring and alerts configured

### Deployment Steps

```bash
# 1. Create database backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/sos-db"

# 2. Run migrations
npm run migrate:up

# 3. Deploy new service version
docker build -t sos-service:1.0.0 .
docker tag sos-service:1.0.0 registry/sos-service:1.0.0
docker push registry/sos-service:1.0.0

# 4. Update deployment
kubectl set image deployment/sos-service \
  sos-service=registry/sos-service:1.0.0

# 5. Verify deployment
kubectl rollout status deployment/sos-service

# 6. Run smoke tests
npm run test:smoke
```

### Rollback Plan

```bash
# If issues detected:
kubectl rollout undo deployment/sos-service
kubectl rollout status deployment/sos-service

# Restore from backup if needed
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/sos-db" dump/
```

---

## Monitoring & Observability

### Metrics to Track

| Metric | Alert Threshold |
|--------|-----------------|
| Response Time (p95) | > 500ms |
| Error Rate | > 1% |
| Anonymous User Sessions | > 10,000 |
| Concurrent WebSocket Connections | > 5,000 |
| Database Query Time | > 1000ms |
| Location Update Frequency | > 10/sec per SOS |

### Logging Configuration

```typescript
// Example application logging
import { createLogger } from './utils/logger';

const logger = createLogger('SOSService');

// Log anonymous participation
logger.info('Anonymous user joined SOS', {
  sosId: 'sos-123',
  deviceId: 'device-456',
  timestamp: new Date()
});

// Log location updates
logger.debug('Location updated', {
  sosId: 'sos-123',
  coordinates: [120.9842, 14.5995],
  accuracy: 10
});
```

### Alerts Configuration

```yaml
# prometheus-alerts.yml
groups:
  - name: sos-service-anonymous
    rules:
      - alert: HighAnonymousParticipation
        expr: sos_active_participants{type="ANON_RESCUER"} > 1000
        for: 5m
        annotations:
          summary: "High anonymous rescuer participation"

      - alert: SlowLocationUpdates
        expr: histogram_quantile(0.95, sos_location_update_duration_ms) > 500
        for: 10m
        annotations:
          summary: "Slow location update processing"
```

---

## FAQ & Troubleshooting

### Q: How do we prevent anonymous users from abusing the system?

**A:** Multiple safeguards:
1. Rate limiting per device ID
2. Device fingerprinting to detect duplicates
3. SOS creation limits (5 per hour per device)
4. Report/block mechanism for malicious users
5. Geographic bounds validation

### Q: How do we handle user privacy for anonymous rescuers?

**A:** Privacy measures:
1. No personal data required for joining
2. Device ID anonymization after 30 days
3. Location data only shared with active participants
4. No persistent user profiles
5. GDPR-compliant data deletion

### Q: What if an anonymous user joins but doesn't participate?

**A:** Cleanup strategies:
1. Auto-leave after 30 minutes of inactivity
2. Remove idle participants on SOS closure
3. Periodic cleanup of stale locations
4. Device record cleanup after 90 days

### Q: How do we scale to handle thousands of anonymous users?

**A:** Scalability features:
1. WebSocket connection pooling
2. Geospatial indexing for efficient queries
3. Location data compression
4. Database read replicas
5. Caching for frequently accessed SOS
6. Load balancing across service instances

---

## Appendix: Code Templates

### Repository Pattern for Participants

```typescript
export class SosParticipantRepository {
  async create(data: Partial<Participant>): Promise<Participant> {
    const participant = await ParticipantModel.create(data);
    return this.mapToDTO(participant);
  }

  async findAll(sosId: string): Promise<Participant[]> {
    const participants = await ParticipantModel.find({ sosId });
    return participants.map(p => this.mapToDTO(p));
  }

  async countAnonymous(sosId: string): Promise<number> {
    return await ParticipantModel.countDocuments({
      sosId,
      userType: 'ANON_RESCUER'
    });
  }

  private mapToDTO(participant: IParticipant): Participant {
    return {
      id: participant._id?.toString() || '',
      sosId: participant.sosId,
      userId: participant.userId,
      userType: participant.userType,
      status: participant.status,
      joinedAt: participant.joinedAt,
      leftAt: participant.leftAt
    };
  }
}
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 | Team | Initial specification for anonymous rescuer feature |

