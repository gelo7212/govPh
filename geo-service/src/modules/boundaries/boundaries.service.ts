import { BarangayRepository } from './boundaries.repository';
import { BoundariesSeed } from './boundaries.seed';
import { Province, Municipality, Barangay } from './boundaries.types';

export class BoundariesService {
  private repository: BarangayRepository;
  private seed: BoundariesSeed;

  constructor() {
    this.repository = new BarangayRepository();
    this.seed = new BoundariesSeed();
  }

  /**
   * Get all provinces
   */
  getAllProvinces(): Province[] {
    return this.seed.getAllProvinces();
  }

  /**
   * Get province by code
   */
  getProvinceByCode(code: string): Province | undefined {
    return this.seed.getProvinceByCode(code);
  }

  /**
   * Get municipalities by province name
   */
  getMunicipalitiesByProvinceName(provinceName: string): Municipality[] {
    if (!provinceName) {
      throw new Error('Province name is required');
    }

    const municipalities = this.seed.getMunicipalitiesByProvinceName(
      provinceName
    );

    if (municipalities.length === 0) {
      throw new Error(
        `No municipalities found for province: ${provinceName}`
      );
    }

    return municipalities;
  }

  /**
   * Get municipality by code
   */
  getMunicipalityByCode(code: string): Municipality | undefined {
    return this.seed.getMunicipalityByCode(code);
  }

  /**
   * Get barangays by municipality code
   * If not in DB, load from static data and save to DB
   */
  async getBarangaysByMunicipalityCode(
    municipalityCode: string
  ): Promise<Barangay[]> {
    if (!municipalityCode) {
      throw new Error('Municipality code is required');
    }

    // Check if barangays exist in database
    const dbBarangays = await this.repository.findByMunicipalityCode(
      municipalityCode
    );

    // If barangays exist in DB, return them
    if (dbBarangays && dbBarangays.length > 0) {
      return dbBarangays;
    }

    // Load from static data
    const staticBarangays = this.seed.getStaticBarangaysByMunicipalityCode(
      municipalityCode
    );

    if (staticBarangays.length === 0) {
      throw new Error(
        `No barangays found for municipality code: ${municipalityCode}`
      );
    }

    // Save to database for future queries
    try {
      await this.repository.createMany(staticBarangays);
    } catch (error) {
      // If error is due to duplicate, it's okay - just fetch from DB
      console.log(
        `Barangays for municipality ${municipalityCode} already exist in database or insertion failed`
      );
    }

    return staticBarangays;
  }

  /**
   * Get all barangays from database
   */
  async getAllBarangays(): Promise<Barangay[]> {
    return this.repository.getAll();
  }

  /**
   * Seed barangays from static data to database
   */
  async seedBarangaysToDatabase(): Promise<void> {
    try {
      const allBarangays = this.seed.loadBarangays();

      for (const barangay of allBarangays) {
        const exists = await this.repository.exists(barangay.code);
        if (!exists) {
          await this.repository.create(barangay);
        }
      }

      console.log('Barangays seeding completed successfully');
    } catch (error) {
      console.error('Error seeding barangays:', error);
    }
  }
}
