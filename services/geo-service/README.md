# Geo Service

A microservice for managing geographic boundaries - provinces, municipalities, and barangays in the Philippines.

## Features

- Get all provinces
- Get municipalities by province code
- Get barangays by municipality code (with automatic database seeding)
- PSGC-compliant data structure

## API Endpoints

### Provinces
```
GET /geo/boundaries/provinces
```

Response:
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

### Municipalities
```
GET /geo/boundaries/municipalities?province=Bulacan
```

Response:
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

### Barangays
```
GET /geo/boundaries/barangays?municipalityCode=030140001
```

Response:
```json
{
  "success": true,
  "message": "Barangays retrieved successfully for municipality 030140001",
  "data": [
    {
      "code": "030140001001",
      "name": "Poblacion",
      "municipalityCode": "030140001"
    }
  ],
  "total": 1
}
```

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Create `.env` file:
```
MONGO_URI=mongodb://localhost:27017/geo-service
PORT=3002
NODE_ENV=development
CORS_ORIGIN=*
```

## Data Structure

### Province
```json
{
  "code": "0102800000",
  "name": "Ilocos Norte",
  "region": "Region I (Ilocos Region)"
}
```

### Municipality
```json
{
  "code": "0301400001",
  "name": "Angat",
  "type": "Mun",
  "district": "1st",
  "zip_code": "3010",
  "region": "Region III (Central Luzon)",
  "province": "Bulacan"
}
```

### Barangay
```json
{
  "code": "030140001001",
  "name": "Poblacion",
  "municipalityCode": "030140001"
}
```

## PSGC Coding

- **Province**: 10-digit code (e.g., 0301400000)
- **Municipality**: 9-digit code (e.g., 030140001)
- **Barangay**: 11-digit code (e.g., 030140001001)

## Database Schema

### Barangays Collection
- Stores barangays loaded from static JSON files
- Indexed by `code` (unique) and `municipalityCode` (for fast lookups)
- Automatic timestamps (createdAt, updatedAt)
- Lazy-loaded: when requested, barangays are loaded from static data if not in DB and cached for future queries
