import { ChatMessage, SenderType } from './chat-message.entity';

export interface ChatMessageResponse {
  id: number;
  senderId: number;
  receiverId: number;
  senderType: SenderType;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSummaryResponse {
  userId: number;
  username: string;
  email?: string;
  photo_urls?: string[];
  lastMessage?: ChatMessageResponse | null;
  unreadCount: number;
}

export function toChatMessageResponse(
  message: ChatMessage,
): ChatMessageResponse {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    senderType: message.senderType,
    message: message.message,
    isRead: message.isRead,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export function toChatSummaryResponse(chat: {
  userId: number;
  username: string;
  email?: string;
  photo_urls?: string[];
  lastMessage?: ChatMessage | null;
  unreadCount: number;
}): ChatSummaryResponse {
  return {
    userId: chat.userId,
    username: chat.username,
    email: chat.email,
    photo_urls: chat.photo_urls,
    lastMessage: chat.lastMessage
      ? toChatMessageResponse(chat.lastMessage)
      : null,
    unreadCount: chat.unreadCount,
  };
}
