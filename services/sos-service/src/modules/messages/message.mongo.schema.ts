import { Schema, model, Document, Types } from 'mongoose';

export interface ISosMessage extends Document {
  sosId: string;
  senderType: 'CITIZEN' | 'SOS_ADMIN' | 'RESCUER';
  senderId?: Types.ObjectId | null;
  senderDisplayName: string;
  contentType: 'text' | 'system';
  content: string;
  createdAt: Date;
}

const sosMessageSchema = new Schema<ISosMessage>(
  {
    sosId: {
      type: String,
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ['SOS_ADMIN', 'CITIZEN', 'RESCUER'],
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
    },
    senderDisplayName: {
      type: String,
      required: false,
    },
    contentType: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Compound index for efficient message retrieval by SOS and time
sosMessageSchema.index({ sosId: 1, createdAt: 1 });

export const SosMessageModel = model<ISosMessage>('sos_messages', sosMessageSchema);
