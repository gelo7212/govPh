import { Schema, model } from 'mongoose';

/**
 * Form Submission Document Type
 */
export interface ISubmission {
  _id?: string;
  schemaId: string;
  formKey: string;
  data: Record<string, any>;
  status: 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

const submissionSchema = new Schema<ISubmission>({
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
  status: {
    type: String,
    enum: ['SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED'],
    default: 'SUBMITTED',
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
  reviewedAt: Date,
  reviewedBy: String,
  notes: String,
});

// Indexes
submissionSchema.index({ schemaId: 1, createdAt: -1 });
submissionSchema.index({ formKey: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ createdBy: 1 });

export const SubmissionModel = model<ISubmission>('submissions', submissionSchema);
