import type { StoreApi } from 'zustand';
import type { Conversation, Message, User } from '@/entities';
import type { ChatApi, RealtimeClient, RealtimeEvent } from '@/services';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

/** Loaded messages of one conversation, oldest first, plus paging state. */
export interface Thread {
  ids: string[];
  hasMore: boolean;
  status: LoadStatus;
  olderStatus: LoadStatus;
}

export interface SessionSlice {
  currentUserId: string;
  users: Record<string, User>;
  conversations: Record<string, Conversation>;
  bootstrapStatus: LoadStatus;
  activeConversationId?: string;
  bootstrap: () => Promise<void>;
  /** Opens a conversation: loads its messages and marks it read. */
  setActiveConversation: (conversationId?: string) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  /** Throw on failure so the UI can show feedback. */
  addMember: (conversationId: string, userId: string) => Promise<void>;
  removeMember: (conversationId: string, userId: string) => Promise<void>;
}

export interface MessagesSlice {
  messages: Record<string, Message>;
  threads: Record<string, Thread>;
  loadMessages: (conversationId: string) => Promise<void>;
  loadOlderMessages: (conversationId: string) => Promise<void>;
  /** Optimistic: shows instantly as "sending", ends as "sent" or "failed". Never throws. */
  sendMessage: (conversationId: string, text: string, replyToId?: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  /** Optimistic with rollback. Throw on failure so the UI can show feedback. */
  editMessage: (messageId: string, text: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
}

export interface RealtimeSlice {
  /** User ids currently typing, per conversation. */
  typing: Record<string, string[]>;
  handleRealtimeEvent: (event: RealtimeEvent) => void;
}

export interface UiSlice {
  /** Unsent composer text per conversation (persisted). */
  drafts: Record<string, string>;
  setDraft: (conversationId: string, text: string) => void;
}

export type ChatState = SessionSlice & MessagesSlice & RealtimeSlice & UiSlice;

export interface StoreDeps {
  api: ChatApi;
  realtime: RealtimeClient;
}

export type SliceCreator<T> = (
  set: StoreApi<ChatState>['setState'],
  get: StoreApi<ChatState>['getState'],
  deps: StoreDeps,
) => T;
