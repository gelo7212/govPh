import { BoundariesSeed } from './boundaries.seed';
import { ProvinceModel, MunicipalityModel, BarangayModel } from './boundaries.schema';
import { logger } from '../../utils/logger';

export class BoundariesSeeder {
  private boundariesSeed: BoundariesSeed;

  constructor() {
    this.boundariesSeed = new BoundariesSeed();
  }

  /**
   * Seed all boundaries data
   */
  async seedAll(): Promise<void> {
    try {
      logger.info('Starting boundaries seeding...');

      await this.seedProvinces();
      await this.seedMunicipalities();
      await this.seedBarangays();

      logger.info('Boundaries seeding completed successfully');
    } catch (error) {
      logger.error('Error seeding boundaries:', error);
      throw error;
    }
  }

  /**
   * Seed provinces
   */
  async seedProvinces(): Promise<void> {
    try {
      logger.info('Seeding provinces...');

      const provinces = this.boundariesSeed.getAllProvinces();

      if (provinces.length === 0) {
        logger.warn('No provinces found in data file');
        return;
      }

      // Clear existing data
      await ProvinceModel.deleteMany({});

      // Insert provinces
      const result = await ProvinceModel.insertMany(provinces, { ordered: false });

      logger.info(`Successfully seeded ${result.length} provinces`);
    } catch (error) {
      logger.error('Error seeding provinces:', error);
      throw error;
    }
  }

  /**
   * Seed municipalities
   */
  async seedMunicipalities(): Promise<void> {
    try {
      logger.info('Seeding municipalities...');

      const municipalities = this.boundariesSeed.getAllMunicipalities();

      if (municipalities.length === 0) {
        logger.warn('No municipalities found in data file');
        return;
      }

      // Clear existing data
      await MunicipalityModel.deleteMany({});

      // Insert municipalities
      const result = await MunicipalityModel.insertMany(municipalities, {
        ordered: false,
      });

      logger.info(`Successfully seeded ${result.length} municipalities`);
    } catch (error) {
      logger.error('Error seeding municipalities:', error);
      throw error;
    }
  }

  /**
   * Seed barangays
   */
  async seedBarangays(): Promise<void> {
    try {
      logger.info('Seeding barangays...');

      const barangays = this.boundariesSeed.loadBarangays();

      if (barangays.length === 0) {
        logger.warn('No barangays found in data file');
        return;
      }

      // Clear existing data
      await BarangayModel.deleteMany({});

      // Insert barangays
      const result = await BarangayModel.insertMany(barangays, {
        ordered: false,
      });

      logger.info(`Successfully seeded ${result.length} barangays`);
    } catch (error) {
      logger.error('Error seeding barangays:', error);
      throw error;
    }
  }

  /**
   * Get seeding statistics
   */
  async getStatistics(): Promise<{
    provinces: number;
    municipalities: number;
    barangays: number;
  }> {
    const provinces = await ProvinceModel.countDocuments();
    const municipalities = await MunicipalityModel.countDocuments();
    const barangays = await BarangayModel.countDocuments();

    return {
      provinces,
      municipalities,
      barangays,
    };
  }
}
