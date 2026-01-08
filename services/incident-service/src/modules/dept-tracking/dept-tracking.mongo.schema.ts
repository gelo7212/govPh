import { Schema, model, Document } from 'mongoose';

export interface IDeptTrackingToken extends Document {
  jwt: string;
  cityId: string;
  departmentId: string;
  scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE';
  assignmentId?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdBy: string;
  createdAt: Date;
}

const DeptTrackingTokenSchema = new Schema<IDeptTrackingToken>(
  {
    jwt: { type: String, required: true, unique: true },

    cityId: { type: String, required: true, index: true },
    departmentId: { type: String, required: true, index: true },

    scope: {
      type: String,
      enum: ['ASSIGNMENT_ONLY', 'DEPT_ACTIVE'],
      required: true
    },

    assignmentId: {
      type: String,
      required: function () {
        return this.scope === 'ASSIGNMENT_ONLY';
      }
    },

    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date },

    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const DeptTrackingToken = model(
  'DeptTrackingToken',
  DeptTrackingTokenSchema
);