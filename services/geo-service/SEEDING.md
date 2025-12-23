# Boundaries Seeding Guide

This guide explains how to seed the Philippine geographical boundaries data (provinces, municipalities, and barangays) into MongoDB.

## Files Overview

- **boundaries.seed.ts** - Reads JSON data files and provides access methods
- **boundaries.seeder.ts** - Main seeder class that handles database operations
- **seed.ts** - CLI entry point for running the seed script

## Data Files

The data is stored in the `data/` directory:
- `regions.json` - Philippine provinces with their region information
- `cities.json` - Municipalities (cities) grouped by province
- `barangays.json` - Barangays with their municipality codes

## How to Seed

### Using npm script (Recommended)

From the `geo-service` directory:

```bash
# Using ts-node (development)
npm run seed

# Using compiled JavaScript (production)
npm run build
npm run seed:build
```

### Manual seeding in code

```typescript
import { connectDatabase, disconnectDatabase } from './config/database';
import { BoundariesSeeder } from './modules/boundaries/boundaries.seeder';

const seedBoundaries = async () => {
  await connectDatabase();
  const seeder = new BoundariesSeeder();
  await seeder.seedAll();
  await disconnectDatabase();
};

seedBoundaries();
```

### Seed specific boundaries

```typescript
const seeder = new BoundariesSeeder();

// Seed only provinces
await seeder.seedProvinces();

// Seed only municipalities
await seeder.seedMunicipalities();

// Seed only barangays
await seeder.seedBarangays();
```

## Database Collections

The seeder creates/updates the following MongoDB collections:

1. **provinces**
   - Fields: `code`, `name`, `region`, `timestamps`
   - Indexed on: `code` (unique)

2. **municipalities**
   - Fields: `code`, `name`, `province`, `timestamps`
   - Indexed on: `code` (unique), `province`

3. **barangays**
   - Fields: `code`, `name`, `municipalityCode`, `timestamps`
   - Indexed on: `code` (unique), `municipalityCode`

## Getting Statistics

After seeding, you can check the data count:

```typescript
const seeder = new BoundariesSeeder();
const stats = await seeder.getStatistics();
console.log(stats);
// Output: { provinces: 81, municipalities: 1474, barangays: 42046 }
```

## Notes

- The seeding process clears existing data before inserting new records
- All operations use `insertMany` with `ordered: false` to handle potential duplicate errors gracefully
- The seeder requires an active MongoDB connection
- Use environment variables to configure MongoDB URI: `MONGODB_URI`

## Docker Usage

If running in Docker, ensure MongoDB is accessible:

```bash
docker-compose -f docker-compose.local.yml up --build
npm run seed
```

## Troubleshooting

- **Connection refused**: Ensure MongoDB is running and accessible
- **No data found**: Check that data files exist in `src/modules/boundaries/data/`
- **Duplicate key error**: Clear the database manually or restart with clean data

```bash
# Clear all boundary collections
db.provinces.deleteMany({})
db.municipalities.deleteMany({})
db.barangays.deleteMany({})
```
