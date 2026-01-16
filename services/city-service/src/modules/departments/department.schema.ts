import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  cityCode: string;
  cityId: string;
  code: string;
  name: string;
  contactNumber?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  handlesIncidentTypes: string[];
  sosCapable: boolean;
  socialMediaLinks?: Map<string, string>;
  businessHours?: string;
  category?: string
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DepartmentSchema = new Schema(
  {
    cityCode: {
      type: String,
      required: true,
      index: true,
    },

    cityId: {
      type: String,
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
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
      lat: { type: Number },
      lng: { type: Number },
    },

    handlesIncidentTypes: {
      type: [String],
      default: [],
    },

    sosCapable: {
      type: Boolean,
      default: false,
    },
    socialMediaLinks: {
      type: Map,
      of: String,
    },
    businessHours: {
      type: String,
    },
    category: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'departments',
  },
);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
