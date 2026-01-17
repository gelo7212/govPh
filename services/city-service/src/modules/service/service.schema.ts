import { Schema, Document } from 'mongoose';

export interface IService extends Document {
  _id: string;
  cityId: string;

  code: string; // MED_ASSIST, SCHOLAR, JOBS, etc.
  title: string;
  shortDescription: string;
  category: 'health' | 'education' | 'employment' | 'social' | 'financial' | 'housing' | 'legal' | string; // extensible categories
  icon?: string;

  isActive: boolean;

  // informational form (NO submission)
  infoForm?: {
    formId: string;
    version?: number;
  };

  // application form (WITH submission)
  applicationForm?: {
    formId: string;
    version?: number;
  };

  availability?: {
    startAt?: Date;
    endAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const ServiceSchema = new Schema<IService>(
  {
    cityId: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    infoForm: {
      formId: {
        type: String,
      },
      version: {
        type: Number,
        default: 1,
      },
    },
    applicationForm: {
      formId: {
        type: String,
      },
      version: {
        type: Number,
        default: 1,
      },
    },
    availability: {
      startAt: {
        type: Date,
      },
      endAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Create compound index for cityId and code uniqueness
ServiceSchema.index({ cityId: 1, code: 1 }, { unique: true });
