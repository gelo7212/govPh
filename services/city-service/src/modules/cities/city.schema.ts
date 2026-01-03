import { Schema } from 'mongoose';

export const CitySchema = new Schema(
  {
    cityCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    provinceCode: {
      type: String,
      required: true,
      index: true,
    },

    centerLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'cities',
  },
);
