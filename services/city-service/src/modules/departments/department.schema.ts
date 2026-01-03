import { Schema } from 'mongoose';

export const DepartmentSchema = new Schema(
  {
    cityCode: {
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

    handlesIncidentTypes: {
      type: [String],
      default: [],
    },

    sosCapable: {
      type: Boolean,
      default: false,
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
