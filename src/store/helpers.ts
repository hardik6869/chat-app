import type { Message } from '@/entities';
import type { ChatState } from './types';

type Patch = Partial<ChatState>;

/** Adds a message to its conversation: thread (if loaded), lastMessage and unread count. */
export function appendMessage(state: ChatState, message: Message, unreadDelta = 0): Patch {
  const conversation = state.conversations[message.conversationId];
  if (!conversation) return {};
  const thread = state.threads[message.conversationId];
  const loaded = thread?.status === 'success';

  return {
    messages: loaded ? { ...state.messages, [message.id]: message } : state.messages,
    threads:
      loaded && !thread.ids.includes(message.id)
        ? {
            ...state.threads,
            [message.conversationId]: { ...thread, ids: [...thread.ids, message.id] },
          }
        : state.threads,
    conversations: {
      ...state.conversations,
      [conversation.id]: {
        ...conversation,
        lastMessage: message,
        unreadCount: conversation.unreadCount + unreadDelta,
      },
    },
  };
}

/** Replaces a known message and keeps the conversation's lastMessage in sync. */
export function replaceMessage(state: ChatState, message: Message): Patch {
  const conversation = state.conversations[message.conversationId];
  const isLast = conversation?.lastMessage?.id === message.id;

  return {
    messages: { ...state.messages, [message.id]: message },
    conversations:
      conversation && isLast
        ? { ...state.conversations, [conversation.id]: { ...conversation, lastMessage: message } }
        : state.conversations,
  };
}
