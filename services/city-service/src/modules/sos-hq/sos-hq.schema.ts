import { Schema } from 'mongoose';

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

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
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
