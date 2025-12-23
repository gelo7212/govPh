import { ProvinceModel, MunicipalityModel, BarangayModel } from './boundaries.schema';
import { Province, Municipality, Barangay } from './boundaries.types';

export class ProvinceRepository {
  /**
   * Find province by code
   */
  async findByCode(code: string): Promise<Province | null> {
    return ProvinceModel.findOne({ code }).lean();
  }

  /**
   * Get all provinces
   */
  async getAll(): Promise<Province[]> {
    return ProvinceModel.find().sort({ name: 1 }).lean();
  }

  /**
   * Find provinces by region
   */
  async findByRegion(region: string): Promise<Province[]> {
    return ProvinceModel.find({ region }).sort({ name: 1 }).lean();
  }

  /**
   * Create a province
   */
  async create(provinceData: Province): Promise<Province> {
    const province = new ProvinceModel(provinceData);
    return province.save();
  }

  /**
   * Create multiple provinces
   */
  async createMany(provinceData: Province[]): Promise<Province[]> {
    return ProvinceModel.insertMany(provinceData, { ordered: false });
  }

  /**
   * Update province
   */
  async update(code: string, updateData: Partial<Province>): Promise<Province | null> {
    return ProvinceModel.findOneAndUpdate({ code }, updateData, { new: true }).lean();
  }

  /**
   * Delete province
   */
  async delete(code: string): Promise<boolean> {
    const result = await ProvinceModel.deleteOne({ code });
    return result.deletedCount > 0;
  }

  /**
   * Check if province exists
   */
  async exists(code: string): Promise<boolean> {
    const count = await ProvinceModel.countDocuments({ code });
    return count > 0;
  }

  /**
   * Count all provinces
   */
  async count(): Promise<number> {
    return ProvinceModel.countDocuments();
  }
}

export class MunicipalityRepository {
  /**
   * Find municipality by code
   */
  async findByCode(code: string): Promise<Municipality | null> {
    return MunicipalityModel.findOne({ code }).lean();
  }

  /**
   * Get all municipalities
   */
  async getAll(): Promise<Municipality[]> {
    return MunicipalityModel.find().sort({ province: 1, name: 1 }).lean();
  }

  /**
   * Find municipalities by province name
   */
  async findByProvinceName(provinceName: string): Promise<Municipality[]> {
    return MunicipalityModel.find({ province: provinceName }).sort({ name: 1 }).lean();
  }

  /**
   * Find municipalities by province code
   */
  async findByProvinceCode(provinceCode: string): Promise<Municipality[]> {
    return MunicipalityModel.find({ provinceCode }).sort({ name: 1 }).lean();
  }

  /**
   * Find municipalities by region
   */
  async findByRegion(region: string): Promise<Municipality[]> {
    return MunicipalityModel.find({ region }).sort({ name: 1 }).lean();
  }

  /**
   * Create a municipality
   */
  async create(municipalityData: Municipality): Promise<Municipality> {
    const municipality = new MunicipalityModel(municipalityData);
    return municipality.save();
  }

  /**
   * Create multiple municipalities
   */
  async createMany(municipalityData: Municipality[]): Promise<Municipality[]> {
    return MunicipalityModel.insertMany(municipalityData, { ordered: false });
  }

  /**
   * Update municipality
   */
  async update(code: string, updateData: Partial<Municipality>): Promise<Municipality | null> {
    return MunicipalityModel.findOneAndUpdate({ code }, updateData, { new: true }).lean();
  }

  /**
   * Delete municipality
   */
  async delete(code: string): Promise<boolean> {
    const result = await MunicipalityModel.deleteOne({ code });
    return result.deletedCount > 0;
  }

  /**
   * Check if municipality exists
   */
  async exists(code: string): Promise<boolean> {
    const count = await MunicipalityModel.countDocuments({ code });
    return count > 0;
  }

  /**
   * Count all municipalities
   */
  async count(): Promise<number> {
    return MunicipalityModel.countDocuments();
  }
}

export class BarangayRepository {
  /**
   * Find barangay by code
   */
  async findByCode(code: string): Promise<Barangay | null> {
    return BarangayModel.findOne({ code }).lean();
  }

  /**
   * Find barangays by municipality code
   */
  async findByMunicipalityCode(municipalityCode: string): Promise<Barangay[]> {
    return BarangayModel.find({ municipalityCode }).sort({ name: 1 }).lean();
  }

  /**
   * Create a barangay
   */
  async create(barangayData: Barangay): Promise<Barangay> {
    const barangay = new BarangayModel(barangayData);
    return barangay.save();
  }

  /**
   * Create multiple barangays
   */
  async createMany(barangayData: Barangay[]): Promise<Barangay[]> {
    return BarangayModel.insertMany(barangayData, { ordered: false });
  }

  /**
   * Update barangay
   */
  async update(code: string, updateData: Partial<Barangay>): Promise<Barangay | null> {
    return BarangayModel.findOneAndUpdate({ code }, updateData, { new: true }).lean();
  }

  /**
   * Delete barangay
   */
  async delete(code: string): Promise<boolean> {
    const result = await BarangayModel.deleteOne({ code });
    return result.deletedCount > 0;
  }

  /**
   * Get all barangays
   */
  async getAll(): Promise<Barangay[]> {
    return BarangayModel.find().sort({ municipalityCode: 1, name: 1 }).lean();
  }

  /**
   * Check if barangay exists
   */
  async exists(code: string): Promise<boolean> {
    const count = await BarangayModel.countDocuments({ code });
    return count > 0;
  }

  /**
   * Count barangays by municipality code
   */
  async countByMunicipality(municipalityCode: string): Promise<number> {
    return BarangayModel.countDocuments({ municipalityCode });
  }

  /**
   * Count all barangays
   */
  async count(): Promise<number> {
    return BarangayModel.countDocuments();
  }
}
