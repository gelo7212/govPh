/**
 * Message Types - Shared interfaces for messaging module
 */

export interface MessagePayload {
  sosId: string;
  senderType: 'SOS_ADMIN' | 'CITIZEN' | 'RESCUER';
  senderId?: string | null;
  senderDisplayName: string;
  contentType?: 'text' | 'system';
  content: string;
}

export type UserRole ='SOS_ADMIN' | 'CITIZEN' | 'RESCUER';

export interface MessageResponse {
  id: string;
  sosId: string;
  senderType: 'citizen' | 'admin' | 'rescuer';
  senderId?: string | null;
  senderDisplayName: string;
  contentType: 'text' | 'system';
  content: string;
  createdAt: Date;
}

export interface MessagesListResponse {
  data: MessageResponse[];
  total: number;
  skip: number;
  limit: number;
}
