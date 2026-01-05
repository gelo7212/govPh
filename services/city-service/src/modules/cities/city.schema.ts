import {  Schema, Document } from 'mongoose';

export interface ICity extends Document {
  cityCode: string;
  cityId: string;
  name: string;
  provinceCode: string;
  centerLocation: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const CitySchema = new Schema(
  {
    cityCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cityId: {
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
