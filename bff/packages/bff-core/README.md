# BFF Core Package

Shared aggregators, clients, and types for all BFF services.

## Structure

```
bff-core/
├── clients/           # HTTP clients for microservices
│   ├── base.client.ts
│   ├── identity.client.ts
│   ├── sos.client.ts
│   ├── geo.client.ts
│   └── index.ts
├── identity/          # Identity aggregator
│   └── identity.aggregator.ts
├── sos/               # SOS aggregator
│   └── sos.aggregator.ts
├── geo/               # Geo aggregator
│   └── geo.aggregator.ts
├── types/             # Shared type definitions
│   └── index.ts
├── index.ts           # Main export
├── package.json
├── tsconfig.json
└── README.md
```

## Clients

Base HTTP clients for communicating with microservices:

- `BaseClient`: Abstract base class with error handling
- `IdentityServiceClient`: Identity service operations
- `SosServiceClient`: SOS service operations
- `GeoServiceClient`: Geo service operations

## Aggregators

Business logic orchestrators that use clients:

- `IdentityAggregator`: Authentication and user management
- `SosAggregator`: SOS request handling
- `GeoAggregator`: Geographic data and boundaries

## Types

Shared TypeScript interfaces and types used across all BFF services.

## Usage

```typescript
import { IdentityAggregator, SosAggregator } from 'bff-core';
import { IdentityServiceClient, SosServiceClient } from 'bff-core';

const identityClient = new IdentityServiceClient(process.env.IDENTITY_SERVICE_URL);
const identityAggregator = new IdentityAggregator(identityClient);

const sosClient = new SosServiceClient(process.env.SOS_SERVICE_URL);
const sosAggregator = new SosAggregator(sosClient);
```
