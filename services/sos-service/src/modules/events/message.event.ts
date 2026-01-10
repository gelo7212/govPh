/**
 * Message Domain Events
 * These events are emitted when important message state changes occur
 */

export const MESSAGE_EVENTS = {
  // When a new message is sent
  SENT: 'message.sent',
  // When a message response is received (e.g., answering a prompt)
  RESPONSE_RECEIVED: 'message.response_received',
  // When a message is read/viewed
  READ: 'message.read',
  // When a message is deleted
  DELETED: 'message.deleted',
} as const;

export interface AnswerToPrompt {
  promptKey: string;
  action: string;
}

export interface MessageOptions {
  answerTo?: AnswerToPrompt;
  [key: string]: any;
}

export interface MessageSentEvent {
  messageId: string;
  sosId: string;
  senderType: 'CITIZEN' | 'RESPONDER' | 'ADMIN';
  senderId: string;
  senderDisplayName: string;
  contentType: string;
  content: string;
  options?: MessageOptions;
  createdAt: Date;
}

export interface MessageResponseReceivedEvent {
  messageId: string;
  sosId: string;
  senderType: "CITIZEN" | "RESCUER" | "SOS_ADMIN" | "SYSTEM";
  senderId: string;
  senderDisplayName: string;
  contentType: string;
  content: string;
  answerTo: AnswerToPrompt;
  createdAt: Date;
}

export interface MessageReadEvent {
  messageId: string;
  sosId: string;
  readBy: string;
  readAt: Date;
}

export interface MessageDeletedEvent {
  messageId: string;
  sosId: string;
  deletedAt: Date;
}
