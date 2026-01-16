# BFF Core Package

Shared aggregators, clients, and types for all BFF services.

## 📚 Documentation

**NEW**: Submission Service Client Integration  
👉 **[Start with QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** for fast API lookup

### Documentation Guides
1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - API method reference (⭐ START HERE)
2. [SUBMISSION_CLIENT_GUIDE.md](./SUBMISSION_CLIENT_GUIDE.md) - Complete integration guide
3. [SUBMISSION_BFF_EXAMPLES.md](./SUBMISSION_BFF_EXAMPLES.md) - Production code examples
4. [SUBMISSION_INTEGRATION_SUMMARY.md](./SUBMISSION_INTEGRATION_SUMMARY.md) - Technical details
5. [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) - Verification status
6. [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) - Final implementation report

## Structure

```
bff-core/
├── clients/           # HTTP clients for microservices
│   ├── base.client.ts
│   ├── identity.client.ts
│   ├── sos.client.ts
│   ├── geo.client.ts
│   ├── submission.client.ts    ← NEW
│   └── index.ts
├── identity/          # Identity aggregator
│   └── identity.aggregator.ts
├── sos/               # SOS aggregator
│   └── sos.aggregator.ts
├── geo/               # Geo aggregator
│   └── geo.aggregator.ts
├── submission/        # Submission aggregator ← NEW
│   ├── submission.types.ts
│   ├── submission.aggregator.ts
│   └── index.ts
├── types/             # Shared type definitions
│   └── index.ts
├── index.ts           # Main export
├── package.json
├── tsconfig.json
└── README.md
```

## Submission Service Client (NEW)

Complete TypeScript client for submission-service with:
- ✅ 17 API endpoints covered
- ✅ Full type safety
- ✅ 8 aggregator utilities
- ✅ Production-ready examples
- ✅ Comprehensive documentation

### Quick Start
```typescript
import { SubmissionServiceClient } from '@gov-ph/bff-core';

const client = new SubmissionServiceClient(
  'http://submission-service:3006',
  { authorization: token }
);

// List schemas
const schemas = await client.getAllSchemas({status: 'PUBLISHED'}, token);

// Create submission
const submission = await client.createSubmission({
  schemaId: '123',
  formKey: 'permit_form',
  data: {field1: 'value1'}
}, token);
```

**For complete guide, see: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**

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
