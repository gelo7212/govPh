#!/usr/bin/env node

import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { BoundariesSeeder } from './modules/boundaries/boundaries.seeder';
import { logger } from '../src/utils/logger';

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database...');
    await connectDatabase();

    const seeder = new BoundariesSeeder();

    logger.info('Running seeder...');
    await seeder.seedAll();

    const stats = await seeder.getStatistics();
    logger.info('Seeding statistics:', stats);

    logger.info('Disconnecting from database...');
    await disconnectDatabase();

    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  }
};

seedDatabase();
