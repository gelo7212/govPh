import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvacuationCenter extends Document {
  // Ownership / Scope
  cityId: string;

  // Identity
  name: string; // e.g. "Calumpit Central School Gym"

  // Location
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
  landmark?: string;

  // Capacity (PH realistic)
  capacity: {
    maxIndividuals: number;
    maxFamilies?: number;
    currentIndividuals: number;
    currentFamilies?: number;
  };

  // Status
  status: 'OPEN' | 'FULL' | 'CLOSED' | 'STANDBY';

  // Facilities
  facilities: {
    hasElectricity: boolean;
    hasWater: boolean;
    hasToilet: boolean;
    hasMedicalArea?: boolean;
    hasGenerator?: boolean;
    hasInternet?: boolean;
  };

  contactPerson?: {
    name: string;
    phone: string;
    position?: string;
  };

  // Audit / Ops
  lastStatusUpdate?: Date;
  notes?: string;

  // System
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const EvacuationCenterSchema = new Schema(
  {
    cityId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },

    address: {
      type: String,
    },

    landmark: {
      type: String,
    },

    capacity: {
      maxIndividuals: {
        type: Number,
        required: true,
      },
      maxFamilies: {
        type: Number,
      },
      currentIndividuals: {
        type: Number,
        required: true,
        default: 0,
      },
      currentFamilies: {
        type: Number,
        default: 0,
      },
    },

    status: {
      type: String,
      enum: ['OPEN', 'FULL', 'CLOSED', 'STANDBY'],
      default: 'OPEN',
      required: true,
    },

    facilities: {
      hasElectricity: {
        type: Boolean,
        required: true,
      },
      hasWater: {
        type: Boolean,
        required: true,
      },
      hasToilet: {
        type: Boolean,
        required: true,
      },
      hasMedicalArea: {
        type: Boolean,
      },
      hasGenerator: {
        type: Boolean,
      },
      hasInternet: {
        type: Boolean,
      },
    },

    contactPerson: {
      name: {
        type: String,
      },
      phone: {
        type: String,
      },
      position: {
        type: String,
      },
    },

    lastStatusUpdate: {
      type: Date,
    },

    notes: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const EvacuationCenter = mongoose.model<IEvacuationCenter>(
  'EvacuationCenter',
  EvacuationCenterSchema,
);
