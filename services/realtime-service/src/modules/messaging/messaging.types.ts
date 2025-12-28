/**
 * Type definitions for Messaging module
 */

export interface MessageBroadcastRequest {
  sosId: string;
  message: {
    id: string;
    sosId: string;
    senderType: 'citizen' | 'admin' | 'rescuer';
    senderId?: string | null;
    senderDisplayName: string;
    contentType: 'text' | 'system';
    content: string;
    createdAt: Date;
  };
}

export interface BroadcastedMessage {
  id: string;
  sosId: string;
  senderType: 'citizen' | 'admin' | 'rescuer';
  senderId?: string | null;
  senderDisplayName: string;
  contentType: 'text' | 'system';
  content: string;
  createdAt: Date;
  timestamp: number;
}

export interface TypingIndicatorData {
  sosId: string;
  displayName: string;
  userId?: string;
}

export interface TypingBroadcastData {
  userId: string;
  displayName: string;
  sosId: string;
  timestamp: number;
}
