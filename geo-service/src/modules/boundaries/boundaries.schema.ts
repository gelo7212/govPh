import mongoose, { Schema, Document } from 'mongoose';
import { Barangay } from './boundaries.types';

type BarangayDocument = Omit<Barangay, '_id'> & Document;

const barangaySchema = new Schema<BarangayDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    municipalityCode: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BarangayModel = mongoose.model<BarangayDocument>(
  'Barangay',
  barangaySchema
);
