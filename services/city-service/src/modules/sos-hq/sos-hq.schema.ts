import { Schema, Document } from 'mongoose';

export interface ISosHQ extends Document {
  scopeLevel: 'CITY' | 'PROVINCE';
  cityCode?: string;
  cityId?: string;
  provinceCode?: string;
  name: string;
  contactNumber?: string;
  address?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  coverageRadiusKm?: number;
  supportedDepartmentCodes: string[];
  isMain: boolean;
  isTemporary: boolean;
  isActive: boolean;
  activatedAt?: Date;
  deactivatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const SosHQSchema = new Schema(
  {
    scopeLevel: {
      type: String,
      enum: ['CITY', 'PROVINCE'],
      required: true,
      index: true,
    },

    cityCode: {
      type: String,
      index: true,
      required: function (this: any): boolean {
        return this.scopeLevel === 'CITY';
      },
    },

    cityId: {
      type: String,
      index: true,
      required: function (this: any): boolean {
        return this.scopeLevel === 'CITY';
      },
    },

    provinceCode: {
      type: String,
      index: true,
      required: function (this: any): boolean {
        return this.scopeLevel === 'PROVINCE';
      },
    },

    name: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
    },

    address: {
      type: String,
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    coverageRadiusKm: {
      type: Number,
    },

    supportedDepartmentCodes: {
      type: [String],
      default: [],
    },

    isMain: {
      type: Boolean,
      default: false,
    },

    isTemporary: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    activatedAt: {
      type: Date,
    },

    deactivatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'sos_headquarters',
  },
);

// Create geospatial index for location queries
SosHQSchema.index({ location: '2dsphere' });
