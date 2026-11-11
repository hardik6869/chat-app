import type { Message } from '@/entities';

/** Server → client events, shaped like WebSocket messages. */
export type RealtimeEvent =
  | { type: 'message:new'; message: Message }
  | {
      type: 'message:status';
      conversationId: string;
      messageId: string;
      status: 'delivered' | 'read';
    }
  | { type: 'typing'; conversationId: string; userId: string; isTyping: boolean }
  | { type: 'presence'; userId: string; isOnline: boolean; lastSeenAt?: string };

/** Client → server events. */
export interface ClientEvent {
  type: 'message:sent';
  message: Message;
}

export type RealtimeListener = (event: RealtimeEvent) => void;
