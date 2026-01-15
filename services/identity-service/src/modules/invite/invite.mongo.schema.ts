import * as mongoose from 'mongoose';
import { InviteEntity } from './invite.types';

// Invite Document Type
type InviteDocument = Omit<InviteEntity, 'id'> & mongoose.Document;

const InviteSchema = new mongoose.Schema<InviteDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\d{6}$/, // 6-digit code
    },
    role: {
      type: String,
      enum: ['CITY_ADMIN', 'SOS_ADMIN', 'SK_ADMIN', 'RESCUER'],
      required: true,
      index: true,
    },
    departmentId:{
      type: String,
      required: false,
      index: true,
    },
    department:{
      type: String,
      required: false,
      index: true,
    },
    municipalityCode: {
      type: String,
      required: true,
      index: true,
    },
    createdByUserId: {
      type: String,
      required: true,
      index: true,
    },
    usedByUserId: {
      type: String,
      sparse: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: false, // We manage timestamps manually
  }
);

// Compound indexes for common queries
InviteSchema.index({ role: 1, municipalityCode: 1 });
InviteSchema.index({ createdByUserId: 1, createdAt: -1 });
InviteSchema.index({ usedByUserId: 1, usedAt: -1 });
InviteSchema.index({ expiresAt: 1, usedAt: 1 }); // For cleanup queries

// TTL index to auto-delete expired unused invites after 24 hours
InviteSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 86400, // 24 hours after expiration
    partialFilterExpression: { usedAt: { $exists: false } },
  }
);


export const InviteModel = mongoose.model<InviteDocument>(
  'Invite',
  InviteSchema,
  'invites'
);

export default InviteSchema;
