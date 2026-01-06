import { Schema, model, Document, Types } from 'mongoose';

export interface ISosParticipant extends Document {
  sosId: string;
  userType: 'admin' | 'rescuer';
  userId: Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date | null;
  actorType?: string;
}

const sosParticipantSchema = new Schema<ISosParticipant>(
  {
    sosId: {
      type: String,
      required: true,
    },
    actorType:{
      type: String,
      required: false,
    },
    userType: {
      type: String,
      enum: ['admin', 'rescuer', 'citizen'],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: false,
  },
);

// Prevent duplicate active participation
sosParticipantSchema.index(
  { sosId: 1, userId: 1, leftAt: 1 },
  { unique: true },
);

// Index for querying active participants in an SOS
sosParticipantSchema.index({ sosId: 1, leftAt: 1 });

// Index for querying participant history by user
sosParticipantSchema.index({ userId: 1, joinedAt: -1 });

export const SosParticipantModel = model<ISosParticipant>(
  'sos_participants',
  sosParticipantSchema,
);
