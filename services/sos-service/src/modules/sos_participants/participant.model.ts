import { Types } from 'mongoose';

export interface SosParticipant {
  id: string;
  sosId: string;
  userType: 'admin' | 'rescuer';
  userId: Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date | null;
}
