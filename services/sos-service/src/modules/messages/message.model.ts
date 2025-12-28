import { Types } from 'mongoose';

export interface SosMessage {
  id: string;
  sosId: string;
  senderType: 'SOS_ADMIN' | 'CITIZEN' | 'RESCUER';
  senderId?: Types.ObjectId | null;
  senderDisplayName: string;
  contentType: 'text' | 'system';
  content: string;
  createdAt: Date;
}
