# Backend for Frontend (BFF)

This directory contains the Backend for Frontend services that aggregate and orchestrate calls to multiple microservices.

## Structure

### bff-citizen/
Frontend API for citizen-facing features:
- **Identity Module**: User authentication and profile management
- **SOS Module**: SOS request creation and tracking
- **Geo Module**: Geographic boundary data

### bff-admin/
Frontend API for admin portal:
- User management
- SOS request monitoring and assignment
- Boundary management

### packages/bff-core/
Shared business logic and aggregators used across BFF services.

## Getting Started

### bff-citizen

```bash
cd bff-citizen
npm install
npm run dev
```

### bff-admin

```bash
cd bff-admin
npm install
npm run dev
```

## Architecture

Each BFF service follows a layered architecture:

1. **Routes**: Define HTTP endpoints
2. **Controllers**: Handle HTTP requests/responses
3. **Aggregators**: Orchestrate calls to microservices
4. **Clients**: HTTP clients for microservices
5. **Middleware**: Cross-cutting concerns (auth, logging, etc.)

## Environment Variables

Create a `.env` file in each service directory:

```
IDENTITY_SERVICE_URL=http://localhost:3002
IDENTITY_SERVICE_URL=http://identity-service:3000
SOS_SERVICE_URL=http://localhost:3003
GEO_SERVICE_URL=http://localhost:3004
PORT=3000
```
