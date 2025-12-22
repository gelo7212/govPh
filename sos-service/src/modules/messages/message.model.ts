export interface Message {
  id: string;
  cityId: string;
  sosId: string;
  senderId: string;
  senderRole: 'citizen' | 'rescuer' | 'admin';
  content: string;
  createdAt: Date;
}
