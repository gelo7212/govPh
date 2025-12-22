import { Schema, model, Document } from 'mongoose';

export interface ILocation extends Document {
  cityId: string;
  sosId: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  accuracy?: number;
  timestamp: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    cityId: {
      type: String,
      required: true,
      index: true,
    },
    sosId: {
      type: String,
      required: true,
      index: true,
    },
    location: {
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
    accuracy: {
      type: Number,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  },
);

// TTL index to auto-delete location data after 30 days
locationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

// Geospatial index for distance-based queries
locationSchema.index({ location: '2dsphere' });

// Compound index for efficient queries by SOS and time
locationSchema.index({ sosId: 1, timestamp: -1 });

// Index for city-based location queries
locationSchema.index({ cityId: 1, timestamp: -1 });

export const LocationModel = model<ILocation>('Location', locationSchema);
