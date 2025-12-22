import * as fs from 'fs';
import * as path from 'path';
import { Province, Municipality, Barangay } from './boundaries.types';

export class BoundariesSeed {
  private provincesPath: string;
  private municipalitiesPath: string;
  private barangaysPath: string;

  constructor() {
    this.provincesPath = path.join(__dirname, 'data', 'regions.json');
    this.municipalitiesPath = path.join(__dirname, 'data', 'cities.json');
    this.barangaysPath = path.join(__dirname, 'data', 'barangays.json');
  }

  /**
   * Load provinces from JSON file
   */
  loadProvinces(): Province[] {
    try {
      const data = fs.readFileSync(this.provincesPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading provinces:', error);
      return [];
    }
  }

  /**
   * Load municipalities from JSON file
   */
  loadMunicipalities(): Municipality[] {
    try {
      const data = fs.readFileSync(this.municipalitiesPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading municipalities:', error);
      return [];
    }
  }

  /**
   * Load barangays from JSON file
   */
  loadBarangays(): Barangay[] {
    try {
      const data = fs.readFileSync(this.barangaysPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading barangays:', error);
      return [];
    }
  }

  /**
   * Get province by code
   */
  getProvinceByCode(code: string): Province | undefined {
    return this.loadProvinces().find((province) => province.code === code);
  }

  /**
   * Get all provinces
   */
  getAllProvinces(): Province[] {
    return this.loadProvinces();
  }

  /**
   * Get municipalities by province name
   */
  getMunicipalitiesByProvinceName(provinceName: string): Municipality[] {
    return this.loadMunicipalities().filter(
      (municipality) =>
        municipality.province.toLowerCase() === provinceName.toLowerCase()
    );
  }

  /**
   * Get municipality by code
   */
  getMunicipalityByCode(code: string): Municipality | undefined {
    return this.loadMunicipalities().find(
      (municipality) => municipality.code === code
    );
  }

  /**
   * Get all municipalities
   */
  getAllMunicipalities(): Municipality[] {
    return this.loadMunicipalities();
  }

  /**
   * Get barangays by municipality code from static data
   */
  getStaticBarangaysByMunicipalityCode(
    municipalityCode: string
  ): Barangay[] {
    return this.loadBarangays().filter(
      (barangay) => barangay.municipalityCode === municipalityCode
    );
  }
}
