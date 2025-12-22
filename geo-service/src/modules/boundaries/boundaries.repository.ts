import { BarangayModel } from './boundaries.schema';
import { Barangay } from './boundaries.types';

export class BarangayRepository {
  /**
   * Find barangay by code
   */
  async findByCode(code: string): Promise<Barangay | null> {
    return BarangayModel.findOne({ code });
  }

  /**
   * Find barangays by municipality code
   */
  async findByMunicipalityCode(municipalityCode: string): Promise<Barangay[]> {
    return BarangayModel.find({ municipalityCode }).sort({ name: 1 });
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
  async update(
    code: string,
    updateData: Partial<Barangay>
  ): Promise<Barangay | null> {
    return BarangayModel.findOneAndUpdate({ code }, updateData, {
      new: true,
    });
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
    return BarangayModel.find().sort({ municipalityCode: 1, name: 1 });
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
}
