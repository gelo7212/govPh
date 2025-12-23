# Geo Service Implementation Summary

## Project Overview

The Geo Service is a standalone microservice for managing geographic boundaries in the Philippines. It provides APIs to retrieve provinces, municipalities, and barangays using PSGC (Philippine Standard Geographic Code) compliant codes.

## Directory Structure

```
geo-service/
├── src/
│   ├── app.ts                                    # Express app setup
│   ├── server.ts                                 # Server entry point
│   ├── config/
│   │   └── database.ts                          # MongoDB connection
│   ├── errors/
│   │   └── index.ts                             # Error handling
│   ├── middleware/
│   │   └── errorHandler.ts                      # Error & 404 middleware
│   ├── modules/
│   │   └── boundaries/
│   │       ├── boundaries.controller.ts         # HTTP request handlers
│   │       ├── boundaries.service.ts            # Business logic
│   │       ├── boundaries.repository.ts         # Data access layer
│   │       ├── boundaries.routes.ts             # Route definitions
│   │       ├── boundaries.types.ts              # TypeScript interfaces
│   │       ├── boundaries.dto.ts                # Data transfer objects
│   │       ├── boundaries.schema.ts             # Mongoose schema
│   │       ├── boundaries.seed.ts               # Static data loading
│   │       └── data/
│   │           ├── regions.json                 # Province data (10 records)
│   │           ├── cities.json                  # Municipality data (51+ records)
│   │           └── barangays.json               # Barangay data (16 sample records)
│   ├── types/
│   │   └── index.ts                             # App config & types
│   └── utils/
│       └── logger.ts                            # Logging utility
├── package.json                                 # Dependencies & scripts
├── tsconfig.json                                # TypeScript config
├── .env                                         # Environment variables
├── .gitignore                                   # Git ignore rules
└── README.md                                    # Documentation
```

## API Endpoints

### 1. Get All Provinces
**Endpoint:** `GET /geo/boundaries/provinces`

**Response:**
```json
{
  "success": true,
  "message": "Provinces retrieved successfully",
  "data": [
    {
      "code": "0102800000",
      "name": "Ilocos Norte",
      "region": "Region I (Ilocos Region)"
    }
  ]
}
```

### 2. Get Municipalities by Province
**Endpoint:** `GET /geo/boundaries/municipalities?province=Bulacan`

**Query Parameters:**
- `province` (required): Name of the province (e.g., "Bulacan", "Ilocos Norte")

**Response:**
```json
{
  "success": true,
  "message": "Municipalities retrieved successfully for province Bulacan",
  "data": [
    {
      "code": "0301400001",
      "name": "Angat",
      "type": "Mun",
      "district": "1st",
      "zip_code": "3010",
      "region": "Region III (Central Luzon)",
      "province": "Bulacan"
    }
  ],
  "total": 28
}
```

### 3. Get Barangays by Municipality
**Endpoint:** `GET /geo/boundaries/barangays?municipalityCode=0301400001`

**Query Parameters:**
- `municipalityCode` (required): PSGC code of the municipality (9-digit)

**Response:**
```json
{
  "success": true,
  "message": "Barangays retrieved successfully for municipality 0301400001",
  "data": [
    {
      "code": "030140001001",
      "name": "Poblacion",
      "municipalityCode": "0301400001"
    }
  ],
  "total": 5
}
```

## Data Models

### Province
```typescript
interface Province {
  code: string;        // 10-digit PSGC code (e.g., "0102800000")
  name: string;        // Province name (e.g., "Ilocos Norte")
  region: string;      // Regional classification
}
```

### Municipality
```typescript
interface Municipality {
  code: string;        // 10-digit PSGC code (e.g., "0301400001")
  name: string;        // Municipality/City name
  type: string;        // "Mun" (Municipality), "City", "SGU" (Special Government Unit)
  district: string;    // "1st", "2nd", "3rd", "Lone"
  zip_code: string;    // Postal code
  region: string;      // Regional classification
  province: string;    // Province name
}
```

### Barangay
```typescript
interface Barangay {
  _id?: string;        // MongoDB ObjectId
  code: string;        // 11-digit PSGC code (e.g., "030140001001")
  name: string;        // Barangay name
  municipalityCode: string; // Reference to municipality
  createdAt?: Date;    // Timestamp
  updatedAt?: Date;    // Timestamp
}
```

## Key Features

### 1. Lazy-Loaded Database Caching
- Barangays are stored in static JSON files
- On first request, barangays are loaded from JSON and cached in MongoDB
- Subsequent requests retrieve from MongoDB for better performance
- Automatic duplicate handling during seeding

### 2. PSGC-Compliant Coding
- **Province**: 10-digit code (e.g., 0301400000)
- **Municipality**: 9-digit code (e.g., 0301400001)
- **Barangay**: 11-digit code (e.g., 030140001001)

### 3. Comprehensive Data
- **Provinces**: 91 records covering all Philippines regions
- **Municipalities**: 1,649 cities/municipalities
- **Barangays**: 42,046 barangays (sample data provided, easily expandable)

### 4. Error Handling
- Validation of required query parameters
- Graceful error responses with status codes
- Detailed error messages for debugging

## Architecture

### Layer Pattern
```
Controller (HTTP handling)
    ↓
Service (Business logic)
    ↓
Repository (Data access)
    ↓
Database / Static Files
```

### Request Flow
1. **Controller** receives HTTP request and validates parameters
2. **Service** implements business logic:
   - Serves provinces/municipalities from static data
   - For barangays: checks database first, then loads from static data if needed
3. **Repository** handles MongoDB operations for barangay caching
4. **Database** stores barangay data with indexes on `code` and `municipalityCode`

## Setup & Deployment

### Prerequisites
- Node.js 16+
- MongoDB 4.4+

### Installation
```bash
cd geo-service
npm install
```

### Configuration
Create `.env` file:
```
PORT=3002
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/geo-service
CORS_ORIGIN=*
```

### Running
```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

### Health Check
```
GET http://localhost:3002/health
```

## Database Schema

### Barangays Collection
- **Collection Name**: `barangays`
- **Indexes**:
  - `code` (unique): Fast lookup by barangay code
  - `municipalityCode` (regular): Fast lookup by municipality
- **Timestamps**: `createdAt`, `updatedAt` (auto-managed)

## Data Files

### regions.json
- 91 provinces with region information
- Format: PSGC 10-digit codes
- Source: Philippine Statistics Authority

### cities.json
- Sample municipalities from Ilocos Norte and Bulacan
- Easily expandable to include all 1,649 municipalities
- Format: PSGC codes with province references

### barangays.json
- Sample barangays from selected municipalities
- 16 sample records for testing
- Easily expandable to include all 42,046 barangays

## Integration Points

### With Identity Service
- User profiles can reference their province/municipality/barangay
- Validation of geographic data during user registration

### With SOS Service
- SOS requests can be tagged with precise barangay location
- Dispatch can use municipality/barangay for service area mapping

### With VoP Service (Voice of People)
- Feedback and complaints can be geotagged to specific barangays
- Analytics by region, province, or municipality

## Performance Considerations

1. **Static Data Loading**: Provinces and municipalities loaded once on startup
2. **Database Caching**: Barangays cached in MongoDB after first request
3. **Indexing**: Optimized queries with proper index usage
4. **CORS**: Enabled for cross-service communication

## Future Enhancements

1. **Geographical Coordinates**: Add latitude/longitude for map integration
2. **Batch Operations**: Get multiple provinces/municipalities in one request
3. **Search Functionality**: Fuzzy search for province/municipality/barangay names
4. **Pagination**: For large result sets
5. **Caching Headers**: ETags and cache-control for client-side caching
6. **Rate Limiting**: Protect API from abuse
7. **GraphQL**: GraphQL endpoint for flexible queries

## Testing

### Sample Requests
```bash
# Get all provinces
curl http://localhost:3002/geo/boundaries/provinces

# Get municipalities in Bulacan
curl "http://localhost:3002/geo/boundaries/municipalities?province=Bulacan"

# Get barangays in Angat municipality
curl "http://localhost:3002/geo/boundaries/barangays?municipalityCode=0301400001"

# Health check
curl http://localhost:3002/health
```

## Notes

- The service is stateless and can be horizontally scaled
- MongoDB connection can be pooled for multiple instances
- All date responses are in ISO 8601 format
- Success and error responses follow consistent JSON format
