# Incident Module Implementation - BFF & BFF-Core

## Overview
Implemented the Incident Management module across the BFF layer with proper separation of concerns using the aggregator pattern.

## Changes Made

### 1. BFF-Core Package (`bff/packages/bff-core`)

#### New Files Created:

**`clients/incident.client.ts`** - IncidentServiceClient
- HTTP client for incident-ms microservice communication
- Methods for incident CRUD operations:
  - `createIncident(data)` - POST /incidents
  - `getIncidentById(incidentId)` - GET /incidents/:id
  - `getIncidentsByCity(cityCode, limit, skip)` - GET /incidents/city/:cityCode
  - `getIncidentsByUserId(userId, limit, skip)` - GET /incidents/user/:userId
  - `getAllIncidents(limit, skip)` - GET /incidents
  - `updateIncidentStatus(incidentId, status)` - PATCH /incidents/:id/status
  - `updateIncident(incidentId, data)` - PUT /incidents/:id
  - `deleteIncident(incidentId)` - DELETE /incidents/:id
- Methods for assignment operations:
  - `createAssignment(data)` - POST /assignments
  - `getAssignmentById(assignmentId)` - GET /assignments/:id
  - `getAssignmentsByIncidentId(incidentId)` - GET /assignments/incident/:incidentId
  - `getAssignmentsByCityAndDepartment(...)` - GET /assignments/department/:cityCode/:departmentCode
  - `getAssignmentsByResponderId(...)` - GET /assignments/responder/:responderId
  - `updateAssignmentStatus(assignmentId, status)` - PATCH /assignments/:id/status
  - `acceptAssignment(assignmentId)` - POST /assignments/:id/accept
  - `rejectAssignment(assignmentId, notes)` - POST /assignments/:id/reject
  - `completeAssignment(assignmentId)` - POST /assignments/:id/complete
  - `updateAssignment(assignmentId, data)` - PUT /assignments/:id
  - `deleteAssignment(assignmentId)` - DELETE /assignments/:id

**`incident/incident.aggregator.ts`** - IncidentAggregator
- Shared orchestration layer for incident operations
- Wraps IncidentServiceClient calls for reuse across BFF services
- Handles both incident and assignment operations

**Updated `clients/index.ts`**
- Exported `IncidentServiceClient` for use in BFF services

### 2. BFF-Citizen Service (`bff/bff-citizen`)

#### New Files Created:

**`src/modules/incident/incident.aggregator.ts`**
- BFF-specific incident aggregator
- Uses @gov-ph/bff-core's IncidentServiceClient
- Handles incident and assignment operations with error handling
- Logs errors to console for debugging

**`src/modules/incident/incident.controller.ts`**
- HTTP request handler for incident operations
- Extracts user context from request for incident creation
- Methods:
  - `createIncident()` - Creates incident with user/guest reporter info
  - `getIncidentById()` - Retrieves specific incident
  - `getIncidentsByCity()` - Lists incidents by city with pagination
  - `getIncidentsByUserId()` - Lists incidents reported by user
  - `getAllIncidents()` - Lists all incidents with pagination
  - `updateIncidentStatus()` - Updates incident status with validation
  - `updateIncident()` - Updates incident details
  - `deleteIncident()` - Deletes incident
  - `createAssignment()` - Creates assignment
  - `getAssignmentById()` - Retrieves assignment
  - `getAssignmentsByIncidentId()` - Lists assignments for incident
  - `getAssignmentsByCityAndDepartment()` - Lists assignments by dept
  - `getAssignmentsByResponderId()` - Lists assignments for responder
  - `acceptAssignment()` - Responder accepts assignment
  - `rejectAssignment()` - Responder rejects assignment
  - `completeAssignment()` - Marks assignment as complete

**`src/modules/incident/incident.routes.ts`**
- Express router for incident endpoints
- Routes:
  - **Incidents**:
    - `POST /incidents` - Create incident
    - `GET /incidents` - List all incidents
    - `GET /incidents/:id` - Get incident by ID
    - `GET /incidents/city/:cityCode` - List by city
    - `GET /incidents/user/:userId` - List by user
    - `PATCH /incidents/:id/status` - Update status
    - `PUT /incidents/:id` - Update incident
    - `DELETE /incidents/:id` - Delete incident
  
  - **Assignments**:
    - `POST /assignments` - Create assignment
    - `GET /assignments/:id` - Get assignment by ID
    - `GET /assignments/incident/:incidentId` - List by incident
    - `GET /assignments/department/:cityCode/:departmentCode` - List by dept
    - `GET /assignments/responder/:responderId` - List by responder
    - `POST /assignments/:id/accept` - Accept assignment
    - `POST /assignments/:id/reject` - Reject assignment
    - `POST /assignments/:id/complete` - Complete assignment

**Updated `src/app.ts`**
- Imported incident routes
- Registered incident routes at `/api/incidents`

## Architecture

```
bff-citizen (API Gateway)
    ↓
incident.routes.ts (Express Router)
    ↓
incident.controller.ts (HTTP Handler)
    ↓
incident.aggregator.ts (BFF-specific Orchestrator)
    ↓
bff-core (Shared Layer)
    ↓
incident.aggregator.ts (Shared Orchestrator)
    ↓
incident.client.ts (HTTP Client)
    ↓
incident-ms (Microservice)
```

## Configuration

The incident service URL is configured via environment variable:
```
INCIDENT_MS_URL=http://localhost:3004  (default)
```

## Usage Example

```typescript
// In bff-citizen
POST /api/incidents
{
  "type": "emergency",
  "title": "Building Fire",
  "severity": "high",
  "location": {
    "lat": 14.5994,
    "lng": 120.9842,
    "cityCode": "CITY001"
  },
  "reporter": {
    "role": "citizen"  // auto-populated from context
  }
}
```

## Integration Points

1. **Authentication**: Uses authContextMiddleware to extract user context
2. **Error Handling**: Consistent error responses through BaseClient
3. **Logging**: Error logging for debugging
4. **Pagination**: Supports limit/skip parameters for list endpoints
5. **Status Validation**: Enforced through incident-ms service

---
Completed: ✅ Clear integration of incident module across BFF layer
