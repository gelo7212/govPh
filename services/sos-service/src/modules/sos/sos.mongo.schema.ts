import { Schema, model, Document } from 'mongoose';

export interface ISOS extends Document {
  cityId?: string;
  citizenId?: string;
  status: 'ACTIVE' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED' | 'CANCELLED' | 'REJECTED' | 'FAKE';
  assignedRescuerId?: string;
  lastKnownLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  address?: {
    city?: string;
    barangay?: string;
  };
  message?: string;
  type?: string;
  createdAt: Date;
  updatedAt: Date;
  soNo: string;
  deviceId?: string;
  resolutionNote?: string;
  assignedResponders?: {
    userId: string;
    sosHQId: string;
    sosHQName: string;
    assignedAt: Date;
    status: 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'REJECTED' | 'LEFT';
  }[];
}

const sosSchema = new Schema<ISOS>(
  {
    cityId: {
      type: String,
      required: false,
      sparse: true,
      index: true,
    },
    citizenId: {
      type: String,
      required: false,
      sparse: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EN_ROUTE', 'ARRIVED', 'RESOLVED', 'CANCELLED', 'REJECTED', 'FAKE'],
      default: 'ACTIVE',
      index: true,
    },
    assignedResponders: {
      type: [
        {
          userId: { type: String, required: true, index: true },
          sosHQId: { type: String, required: true, index: true }, // sosHQ id
          sosHQName: { type: String, required: true, index: true }, // sosHQ name
          assignedAt: { type: Date, default: Date.now },
          status: { type: String, enum: ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'REJECTED'], default: 'ASSIGNED' },
        },
      ],
      default: [],
    },
    address: {
      city: { type: String },
      barangay: { type: String },
    },
    lastKnownLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    message: {
      type: String,
      maxlength: 1000,
    },
    type: {
      type: String,
      maxlength: 100,
    },
    soNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: false,
      index: true,
    },
    resolutionNote: {
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
sosSchema.index({ lastKnownLocation: '2dsphere' }, { sparse: true });

// Additional index for citizen lookups
sosSchema.index({ citizenId: 1, createdAt: -1 });

// Index for rescuer assignment lookup
sosSchema.index({ assignedRescuerId: 1, status: 1 });
sosSchema.index({ 'assignedResponders.userId': 1 });
sosSchema.index({ 'assignedResponders.departmentId': 1 });

// Pre-save hook to remove lastKnownLocation if coordinates are null/invalid
sosSchema.pre('save', function(next) {
  if (this.lastKnownLocation) {
    const { coordinates } = this.lastKnownLocation;
    // Remove the location if coordinates are null, undefined, or contain non-numeric values
    if (!coordinates || coordinates.some((coord: any) => coord === null || coord === undefined || isNaN(coord))) {
      this.lastKnownLocation = undefined;
    }
  }
  next();
});

export const SOSModel = model<ISOS>('SOS', sosSchema);
