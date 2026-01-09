#!/usr/bin/env node

import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { BoundariesSeeder } from './modules/boundaries/boundaries.seeder';
import { logger } from '../src/utils/logger';

export const seedDatabase = async (options: { standalone?: boolean } = {}) => {
  const { standalone = false } = options;
  
  try {
    const shouldConnect = !standalone; // Only connect if not standalone (app already connected)
    
    if (shouldConnect) {
      logger.info('Connecting to database...');
      await connectDatabase();
    }

    const seeder = new BoundariesSeeder();

    logger.info('Running seeder...');
    await seeder.seedAll();

    const stats = await seeder.getStatistics();
    logger.info('Seeding statistics:', stats);

    if (shouldConnect) {
      logger.info('Disconnecting from database...');
      await disconnectDatabase();
    }

    logger.info('Database seeding completed successfully!');
    
    if (standalone) {
      process.exit(0);
    }
  } catch (error) {
    logger.error('Database seeding failed:', error);
    if (standalone) {
      await disconnectDatabase().catch(() => {});
      process.exit(1);
    } else {
      throw error; // Re-throw in app mode to be handled by server
    }
  }
};

// CLI execution when run as standalone script
if (require.main === module) {
  const isStandalone = process.argv.includes('--standalone');
  seedDatabase({ standalone: isStandalone }).catch((error) => {
    logger.error('Seeding failed:', error);
    process.exit(1);
  });
}
