import { Schema, model, Document } from 'mongoose';

export interface ISOS extends Document {
  cityId: string;
  citizenId: string;
  status: 'ACTIVE' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED' | 'CANCELLED';
  assignedRescuerId?: string;
  lastKnownLocation: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sosSchema = new Schema<ISOS>(
  {
    cityId: {
      type: String,
      required: true,
      index: true,
    },
    citizenId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EN_ROUTE', 'ARRIVED', 'RESOLVED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    assignedRescuerId: {
      type: String,
      sparse: true,
      index: true,
    },
    lastKnownLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries by city, status, and time
sosSchema.index({ cityId: 1, status: 1, createdAt: -1 });

// Geospatial index for distance-based queries
sosSchema.index({ lastKnownLocation: '2dsphere' });

// Additional index for citizen lookups
sosSchema.index({ citizenId: 1, createdAt: -1 });

// Index for rescuer assignment lookup
sosSchema.index({ assignedRescuerId: 1, status: 1 });

export const SOSModel = model<ISOS>('SOS', sosSchema);
