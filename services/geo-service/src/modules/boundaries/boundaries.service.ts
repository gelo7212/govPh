import { ProvinceRepository, MunicipalityRepository, BarangayRepository } from './boundaries.repositories';
import { BoundariesSeed } from './boundaries.seed';
import { Province, Municipality, Barangay } from './boundaries.types';

export class BoundariesService {
  private provinceRepository: ProvinceRepository;
  private municipalityRepository: MunicipalityRepository;
  private barangayRepository: BarangayRepository;
  private seed: BoundariesSeed;

  constructor() {
    this.provinceRepository = new ProvinceRepository();
    this.municipalityRepository = new MunicipalityRepository();
    this.barangayRepository = new BarangayRepository();
    this.seed = new BoundariesSeed();
  }

  /**
   * Get all provinces from database
   */
  async getAllProvinces(): Promise<Province[]> {
    return this.provinceRepository.getAll();
  }

  /**
   * Get province by code from database
   */
  async getProvinceByCode(code: string): Promise<Province | null> {
    return this.provinceRepository.findByCode(code);
  }

  /**
   * Get municipalities by province name from database
   */
  async getMunicipalitiesByProvinceName(provinceName: string): Promise<Municipality[]> {
    if (!provinceName) {
      throw new Error('Province name is required');
    }

    const municipalities = await this.municipalityRepository.findByProvinceName(
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
   * Get municipality by code / name from database
   */
  async getMunicipalityByCode(code: string): Promise<Municipality | null> {
    return this.municipalityRepository.findByCode(code);
  }

  /**
   * Get barangays by municipality code from database
   * If not in DB, load from static data and save to DB
   */
  async getBarangaysByMunicipalityCode(
    municipalityCode: string
  ): Promise<Barangay[]> {
    if (!municipalityCode) {
      throw new Error('Municipality code is required');
    }

    // Check if barangays exist in database
    const dbBarangays = await this.barangayRepository.findByMunicipalityCode(
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
      await this.barangayRepository.createMany(staticBarangays);
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
    return this.barangayRepository.getAll();
  }

  /**
   * Get all municipalities from database
   */
  async getAllMunicipalities(): Promise<Municipality[]> {
    return this.municipalityRepository.getAll();
  }

  /**
   * Seed barangays from static data to database
   */
  async seedBarangaysToDatabase(): Promise<void> {
    try {
      const allBarangays = this.seed.loadBarangays();

      for (const barangay of allBarangays) {
        const exists = await this.barangayRepository.exists(barangay.code);
        if (!exists) {
          await this.barangayRepository.create(barangay);
        }
      }

      console.log('Barangays seeding completed successfully');
    } catch (error) {
      console.error('Error seeding barangays:', error);
    }
  }
}
