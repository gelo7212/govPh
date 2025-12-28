# Incident Microservice

Incident Management Microservice for the LGU e-Government platform. Handles incident creation, status tracking, and assignment management.

## Features

- **Incident Management**: Create, retrieve, update, and manage incident records
- **Assignment Management**: Assign incidents to responders with status tracking
- **Location-based Queries**: Query incidents by city or geographic location
- **Multi-department Support**: Support for assignments across multiple departments
- **Status Transitions**: Enforce valid incident and assignment status transitions
- **Audit Ready**: Extensible metadata for tracking and compliance

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
PORT=3004
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/incident-service
LOG_LEVEL=INFO
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm run build
npm start
```

## API Documentation

### Incidents Module

#### Create Incident
- **POST** `/incidents`
- Creates a new incident
- Request body:
  ```json
  {
    "type": "emergency",
    "title": "Building Fire",
    "description": "Fire detected on floor 3",
    "severity": "high",
    "location": {
      "lat": 14.5994,
      "lng": 120.9842,
      "barangayCode": "BR001",
      "cityCode": "CITY001"
    },
    "reporter": {
      "userId": "user123",
      "role": "citizen"
    },
    "attachments": ["url1", "url2"],
    "metadata": {}
  }
  ```

#### Get Incident by ID
- **GET** `/incidents/:id`
- Retrieves a specific incident

#### Get Incidents by City
- **GET** `/incidents/city/:cityCode?limit=50&skip=0`
- Retrieves all incidents in a city with pagination

#### Get Incidents by User
- **GET** `/incidents/user/:userId?limit=50&skip=0`
- Retrieves incidents reported by a specific user

#### Get All Incidents
- **GET** `/incidents?limit=50&skip=0`
- Retrieves all incidents with pagination

#### Update Incident Status
- **PATCH** `/incidents/:id/status`
- Updates incident status
- Request body:
  ```json
  {
    "status": "in_progress"
  }
  ```

#### Update Incident
- **PUT** `/incidents/:id`
- Updates incident details

#### Delete Incident
- **DELETE** `/incidents/:id`
- Deletes an incident

### Assignments Module

#### Create Assignment
- **POST** `/assignments`
- Creates a new incident assignment
- Request body:
  ```json
  {
    "incidentId": "incident123",
    "cityCode": "CITY001",
    "departmentCode": "DEPT001",
    "assignedBy": "system",
    "responderId": "responder123",
    "notes": "Assign to fire dept"
  }
  ```

#### Get Assignment by ID
- **GET** `/assignments/:id`

#### Get Assignments by Incident
- **GET** `/assignments/incident/:incidentId`

#### Get Assignments by Department
- **GET** `/assignments/department/:cityCode/:departmentCode?status=pending&limit=50&skip=0`

#### Get Assignments by Responder
- **GET** `/assignments/responder/:responderId?status=accepted&limit=50&skip=0`

#### Update Assignment Status
- **PATCH** `/assignments/:id/status`

#### Accept Assignment
- **POST** `/assignments/:id/accept`
- Responder accepts the assignment

#### Reject Assignment
- **POST** `/assignments/:id/reject`
- Request body:
  ```json
  {
    "notes": "Unavailable"
  }
  ```

#### Complete Assignment
- **POST** `/assignments/:id/complete`

#### Update Assignment
- **PUT** `/assignments/:id`

#### Delete Assignment
- **DELETE** `/assignments/:id`

## Data Models

### Incident Entity

```typescript
{
  id: string
  type: 'emergency' | 'disaster' | 'accident' | 'crime' | 'medical' | 'other'
  title: string
  description?: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected'
  location: {
    lat: number
    lng: number
    barangayCode?: string
    cityCode: string
  }
  reporter: {
    userId?: string
    role: 'citizen' | 'guest'
  }
  attachments?: string[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}
```

### IncidentAssignment Entity

```typescript
{
  id: string
  incidentId: string
  cityCode: string
  departmentCode: string
  assignedBy: 'system' | 'admin'
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  responderId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

## Status Transitions

### Incident Status Flow
- `open` → `acknowledged` → `in_progress` → `resolved`
- Any status → `rejected`

### Assignment Status Flow
- `pending` → `accepted` → `completed`
- `pending` / `accepted` → `rejected`

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
npm run format
```

## Architecture

The service follows a 3-tier architecture:

1. **Controller Layer**: HTTP request handling
2. **Service Layer**: Business logic and validation
3. **Repository Layer**: Data access and database operations

## License

ISC
