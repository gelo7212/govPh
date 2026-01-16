# Submission Service

Form submission microservice for LGU e-Government platform. Handles form schema management, submission storage, draft management, and validation.

## Features

- **Form Schemas**: Create and manage form definitions
- **Submissions**: Store and retrieve form submissions
- **Drafts**: Auto-save and retrieve draft submissions
- **Validations**: Validate form data against schemas
- **Audit Logging**: Track all submission activities

## Project Structure

```
src/
├── modules/
│   ├── schemas/          # Form schema management
│   ├── submissions/      # Form submission handling
│   ├── drafts/           # Draft submission management
│   └── validations/      # Form validation logic
├── config/               # Configuration files
├── errors/               # Custom error classes
├── middlewares/          # Express middlewares
├── services/             # Business logic services
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Start

```bash
npm start
```

## Environment Variables

See `.env.example` for required environment variables.

## API Endpoints

### Schemas

- `GET /api/schemas` - List all form schemas
- `GET /api/schemas/:id` - Get specific schema
- `POST /api/schemas` - Create new schema
- `PUT /api/schemas/:id` - Update schema
- `DELETE /api/schemas/:id` - Delete schema
- `POST /api/schemas/:id/publish` - Publish schema

### Submissions

- `GET /api/submissions` - List submissions
- `GET /api/submissions/:id` - Get submission
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/:id` - Update submission
- `DELETE /api/submissions/:id` - Delete submission

### Drafts

- `GET /api/drafts` - List drafts
- `POST /api/drafts` - Save draft
- `PUT /api/drafts/:id` - Update draft
- `DELETE /api/drafts/:id` - Delete draft

### Validations

- `POST /api/validations/validate` - Validate form data against schema

## Database

Uses MongoDB for data persistence. Requires MongoDB connection URI.

## Error Handling

All errors are handled and returned in a consistent format with appropriate HTTP status codes.

## Contributing

Follow the existing code structure and patterns when adding new features.
