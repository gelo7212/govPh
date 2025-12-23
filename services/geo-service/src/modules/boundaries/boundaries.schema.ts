import mongoose, { Schema, Document } from 'mongoose';
import { Barangay, Province, Municipality } from './boundaries.types';

// Province Schema
type ProvinceDocument = Omit<Province, '_id'> & Document;

const provinceSchema = new Schema<ProvinceDocument>(
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
    region: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ProvinceModel = mongoose.model<ProvinceDocument>(
  'Province',
  provinceSchema,
  'provinces'
);

// Municipality Schema
type MunicipalityDocument = Omit<Municipality, '_id'> & Document;

const municipalitySchema = new Schema<MunicipalityDocument>(
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
    type: {
      type: String,
      required: false,
    },
    district: {
      type: String,
      required: false,
    },
    zip_code: {
      type: String,
      required: false,
    },
    region: {
      type: String,
      required: false,
    },
    province: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MunicipalityModel = mongoose.model<MunicipalityDocument>(
  'Municipality',
  municipalitySchema,
  'municipalities'
);

// Barangay Schema
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
  barangaySchema,
  'barangays'
);
