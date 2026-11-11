import type { Attachment } from '@/entities';
import type { Database } from '../mock-server';

export interface ChatApiOptions {
  db?: Database;
  latencyMs?: number;
  failureRate?: number;
  random?: () => number;
  /** Requests fail like a real network call while this returns false. */
  isOnline?: () => boolean;
}

export interface SendMessageInput {
  /** Client-generated id: makes optimistic updates and retries idempotent. */
  id: string;
  conversationId: string;
  text: string;
  replyToId?: string;
  attachments?: Attachment[];
}
