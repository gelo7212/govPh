# Submission Service - Quick Start Guide

## Overview

The **submission-service** handles form schema management, submission storage, draft management, and validation for the LGU e-Government platform.

## Architecture

The service is organized into four main modules:

### 1. **Schemas Module** (`modules/schemas/`)
Manages form definitions and schema versioning.

**Key Files:**
- `schemas.mongo.schema.ts` - MongoDB schema definition with FormField type
- `schemas.service.ts` - Business logic for CRUD operations
- `schemas.routes.ts` - REST API endpoints

**Features:**
- Create, read, update, delete form schemas
- Publish schemas (immutable after publishing)
- Version control
- Status tracking (DRAFT → PUBLISHED → ARCHIVED)

### 2. **Submissions Module** (`modules/submissions/`)
Handles form submission data storage and retrieval.

**Key Files:**
- `submissions.mongo.schema.ts` - MongoDB schema for submissions
- `submissions.service.ts` - Submission management logic
- `submissions.routes.ts` - REST API endpoints

**Features:**
- Store form responses
- Track submission status (SUBMITTED → REVIEWED → APPROVED/REJECTED)
- Review notes and approver tracking
- Query by schema or user

### 3. **Drafts Module** (`modules/drafts/`)
Manages auto-saved draft submissions with expiration.

**Key Files:**
- `drafts.mongo.schema.ts` - MongoDB schema with 30-day TTL
- `drafts.service.ts` - Draft management logic
- `drafts.routes.ts` - REST API endpoints

**Features:**
- Auto-save incomplete forms
- 30-day auto-expiration
- Per-user draft management
- Draft-to-submission conversion

### 4. **Validations Module** (`modules/validations/`)
Validates form data against schema definitions using Joi.

**Key Files:**
- `validations.service.ts` - Validation logic
- `validations.routes.ts` - Validation endpoint

**Features:**
- Type checking (email, phone, date, etc.)
- Required field validation
- Custom validation rules
- Field-level error reporting

## Setup Instructions

### 1. Install Dependencies
```bash
cd services/submission-service
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Key variables:
```env
MONGODB_URI=mongodb://localhost:27017/submission-service
PORT=3006
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:3006`

### 4. Check Health
```bash
curl http://localhost:3006/health
```

Expected response:
```json
{
  "success": true,
  "data": { "status": "healthy" },
  "timestamp": "2026-01-17T..."
}
```

## API Quick Reference

### Create a Form Schema
```bash
curl -X POST http://localhost:3006/api/schemas \
  -H "Content-Type: application/json" \
  -d '{
    "formKey": "employment_form",
    "title": "Employment Information",
    "description": "Please fill in your employment details",
    "fields": []
  }'
```

### Publish Schema
```bash
curl -X POST http://localhost:3006/api/schemas/{id}/publish
```

### Submit Form
```bash
curl -X POST http://localhost:3006/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "schemaId": "{id}",
    "formKey": "employment_form",
    "data": {
      "f_1_name": "John Doe",
      "f_2_email": "john@example.com"
    }
  }'
```

### Save Draft
```bash
curl -X POST http://localhost:3006/api/drafts \
  -H "Content-Type: application/json" \
  -d '{
    "schemaId": "{id}",
    "formKey": "employment_form",
    "data": {
      "f_1_name": "John"
    }
  }'
```

### Validate Form Data
```bash
curl -X POST http://localhost:3006/api/validations/validate \
  -H "Content-Type: application/json" \
  -d '{
    "schemaId": "{id}",
    "data": {
      "f_1_name": "John Doe",
      "f_2_email": "john@example.com"
    }
  }'
```

## Project Structure

```
submission-service/
├── src/
│   ├── app.ts                         # Express app setup
│   ├── server.ts                      # Server entry point
│   ├── config/
│   │   └── database.ts                # MongoDB connection
│   ├── errors/
│   │   └── index.ts                   # Custom error classes
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── requestLogger.middleware.ts
│   │   └── schema.validator.middleware.ts
│   ├── modules/
│   │   ├── schemas/
│   │   │   ├── index.ts
│   │   │   ├── schemas.mongo.schema.ts
│   │   │   ├── schemas.routes.ts
│   │   │   └── schemas.service.ts
│   │   ├── submissions/
│   │   │   ├── index.ts
│   │   │   ├── submissions.mongo.schema.ts
│   │   │   ├── submissions.routes.ts
│   │   │   └── submissions.service.ts
│   │   ├── drafts/
│   │   │   ├── index.ts
│   │   │   ├── drafts.mongo.schema.ts
│   │   │   ├── drafts.routes.ts
│   │   │   └── drafts.service.ts
│   │   └── validations/
│   │       ├── index.ts
│   │       ├── validations.routes.ts
│   │       └── validations.service.ts
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validators.ts
│   └── services/                      # (Empty, for future services)
├── .env                               # Local configuration
├── .env.example                       # Configuration template
├── Dockerfile                         # Docker configuration
├── IMPLEMENTATION.md                  # Detailed implementation guide
├── package.json
├── README.md
└── tsconfig.json
```

## Database Schema

### Schemas Collection
```javascript
{
  _id: ObjectId,
  formKey: String (unique),
  version: Number,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  title: String,
  description: String,
  fields: [
    {
      id: String,
      type: String,
      label: String,
      required: Boolean,
      placeholder: String,
      options: [{ label, value }],
      ui: { hint, width }
    }
  ],
  createdAt: Date,
  createdBy: String,
  updatedAt: Date,
  updatedBy: String,
  publishedAt: Date
}
```

### Submissions Collection
```javascript
{
  _id: ObjectId,
  schemaId: String (indexed),
  formKey: String (indexed),
  data: Object,
  status: "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED",
  createdAt: Date (indexed),
  createdBy: String,
  updatedAt: Date,
  updatedBy: String,
  reviewedAt: Date,
  reviewedBy: String,
  notes: String
}
```

### Drafts Collection
```javascript
{
  _id: ObjectId,
  schemaId: String (indexed),
  formKey: String (indexed),
  data: Object,
  createdAt: Date (indexed),
  createdBy: String,
  updatedAt: Date,
  updatedBy: String,
  expiresAt: Date (TTL index)  // Auto-deletes after 30 days
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "fieldName": "Field-specific error"
    }
  },
  "timestamp": "2026-01-17T..."
}
```

## Building & Deployment

### Development Build
```bash
npm run build
```

### Docker Build
```bash
docker build -t submission-service .
```

### Docker Run
```bash
docker run -p 3006:3006 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/submission-service \
  -e NODE_ENV=development \
  submission-service
```

## Next Steps

1. **Authentication** - Add JWT validation middleware
2. **Authorization** - Add role-based access control
3. **File Uploads** - Support file/image field types
4. **Webhooks** - Notify external systems on submission events
5. **Audit Logging** - Track all changes with user attribution
6. **Analytics** - Add reporting endpoints
7. **Real-time** - WebSocket support for live collaboration

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Update MONGODB_URI in .env
MONGODB_URI=mongodb://localhost:27017/submission-service
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3007

# Or kill process on port 3006
# Windows:
netstat -ano | findstr :3006
taskkill /PID {PID} /F

# Mac/Linux:
lsof -ti:3006 | xargs kill -9
```

### npm install Fails
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## Support

For detailed API documentation, see [IMPLEMENTATION.md](IMPLEMENTATION.md)

For service structure and file organization, see [README.md](README.md)
