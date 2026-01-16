import { Schema, model } from 'mongoose';

/**
 * Draft Submission Document Type
 */
export interface IDraft {
  _id?: string;
  schemaId: string;
  formKey: string;
  data: Record<string, any>;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  expiresAt?: Date;
}

const draftSchema = new Schema<IDraft>({
  schemaId: {
    type: String,
    required: true,
    index: true,
  },
  formKey: {
    type: String,
    required: true,
    index: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  createdBy: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: String,
  expiresAt: {
    type: Date,
    index: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
});

// TTL index to auto-delete expired drafts
draftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Indexes
draftSchema.index({ schemaId: 1, createdBy: 1 });
draftSchema.index({ formKey: 1 });

export const DraftModel = model<IDraft>('drafts', draftSchema);
