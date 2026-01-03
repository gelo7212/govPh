# City Service

Microservice for managing cities, departments, and SOS headquarters in the Gov-Ph ecosystem.

## 🏛️ Overview

The City Service manages three core entities:

- **Cities** - LGU identity and operational reference points
- **Departments** - Departmental responsibilities and capability routing
- **SOS Headquarters** - Physical dispatch points (city/province level)

## 📋 Table of Contents

- [Installation](#installation)
- [Development](#development)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Configuration](#configuration)
- [Docker](#docker)

## 🚀 Installation

```bash
npm install
```

## 💻 Development

### Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3005`

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## 📡 API Endpoints

### Cities

- `GET /api/cities` - List all cities
- `GET /api/cities/:cityCode` - Get city details
- `POST /api/cities` - Create city
- `PUT /api/cities/:cityCode` - Update city
- `DELETE /api/cities/:cityCode` - Delete city

### Departments

- `GET /api/departments` - List all departments
- `GET /api/departments/:id` - Get department details
- `GET /api/cities/:cityCode/departments` - Get city departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### SOS Headquarters

- `GET /api/sos-hq` - List all SOS HQ
- `GET /api/sos-hq/:id` - Get SOS HQ details
- `GET /api/cities/:cityCode/sos-hq` - Get city SOS HQ
- `POST /api/sos-hq` - Create SOS HQ
- `PUT /api/sos-hq/:id` - Update SOS HQ
- `DELETE /api/sos-hq/:id` - Delete SOS HQ

## 📊 Data Models

### City Schema

```typescript
{
  cityCode: String (unique, indexed),
  name: String,
  provinceCode: String,
  centerLocation: {
    lat: Number,
    lng: Number
  },
  isActive: Boolean,
  timestamps: true
}
```

### Department Schema

```typescript
{
  cityCode: String (indexed),
  code: String,
  name: String,
  handlesIncidentTypes: [String],
  sosCapable: Boolean,
  isActive: Boolean,
  timestamps: true
}
```

### SOS Headquarters Schema

```typescript
{
  scopeLevel: 'CITY' | 'PROVINCE',
  cityCode: String (indexed, optional),
  provinceCode: String (indexed, optional),
  name: String,
  location: {
    lat: Number,
    lng: Number
  },
  coverageRadiusKm: Number,
  supportedDepartmentCodes: [String],
  isMain: Boolean,
  isTemporary: Boolean,
  isActive: Boolean,
  activatedAt: Date,
  deactivatedAt: Date,
  timestamps: true
}
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `PORT` - Service port (default: 3005)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

## 🐳 Docker

### Build Image

```bash
docker build -t city-service:latest .
```

### Run Container

```bash
docker run -p 3005:3005 \
  -e MONGODB_URI=mongodb://mongo:27017/city-service \
  city-service:latest
```

## 📚 Integration Points

- **Identity Service** - User roles and permissions
- **Incident Service** - Department incident handling
- **SOS Service** - Headquarters dispatch
- **Geo Service** - Location and boundary data
- **Realtime Service** - WebSocket notifications

## 📝 License

MIT
