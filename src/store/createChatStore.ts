import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '@/shared/lib';
import {
  createMessagesSlice,
  createRealtimeSlice,
  createSessionSlice,
  createUiSlice,
} from './slices';
import type { ChatState, StoreDeps } from './types';

const PERSIST_VERSION = 1;

/** Builds the single app store. Dependencies are injected so tests can use fakes. */
export function createChatStore(deps: StoreDeps) {
  return create<ChatState>()(
    persist(
      (set, get) => ({
        ...createSessionSlice(set, get, deps),
        ...createMessagesSlice(set, get, deps),
        ...createRealtimeSlice(set, get, deps),
        ...createUiSlice(set, get, deps),
      }),
      {
        name: 'chat-app:ui',
        version: PERSIST_VERSION,
        storage: createJSONStorage(() => safeStorage),
        // Server data is persisted by the mock backend; the client keeps only unsent drafts.
        partialize: (state) => ({ drafts: state.drafts }),
        migrate: () => ({ drafts: {} }),
      },
    ),
  );
}

export type ChatStore = ReturnType<typeof createChatStore>;

/** Pipes realtime events into the store. Returns a cleanup that disconnects. */
export function connectRealtime(store: ChatStore, realtime: StoreDeps['realtime']) {
  realtime.connect();
  const unsubscribe = realtime.subscribe((event) => {
    store.getState().handleRealtimeEvent(event);
  });
  return () => {
    unsubscribe();
    realtime.disconnect();
  };
}
