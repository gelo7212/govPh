import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  cityId: string;
  sosId: string;
  senderId: string;
  senderRole: 'citizen' | 'rescuer' | 'admin';
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
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
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ['citizen', 'rescuer', 'admin'],
      required: true,
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
messageSchema.index({ sosId: 1, createdAt: -1 });

// Index for city-based message queries
messageSchema.index({ cityId: 1, createdAt: -1 });

// Index for sender queries
messageSchema.index({ senderId: 1, createdAt: -1 });

export const MessageModel = model<IMessage>('Message', messageSchema);
