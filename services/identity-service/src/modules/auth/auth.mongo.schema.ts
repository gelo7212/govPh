/**
 * Revoked Token Schema
 * Stores tokens that have been explicitly revoked for logout and security
 */

import mongoose from 'mongoose';
import { RevokedToken } from '../../types';

const revokedTokenSchema = new mongoose.Schema<RevokedToken>(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // Auto-delete expired revocation records after TTL
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: false,
    collection: 'revoked_tokens',
  }
);

export const RevokedTokenModel = mongoose.model<RevokedToken>(
  'RevokedToken',
  revokedTokenSchema
);
