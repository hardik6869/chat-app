import { chatApi, realtime } from '@/services';
import { connectRealtime, createChatStore } from './createChatStore';

/** The app-wide store, wired to the mock backend. */
export const useChatStore = createChatStore({ api: chatApi, realtime });

/** Starts realtime updates; returns a cleanup for `useEffect`. */
export const startRealtime = () => connectRealtime(useChatStore, realtime);

export { selectConversationList, selectTypingNames } from './selectors';
export type { ConversationFilter } from './selectors';
