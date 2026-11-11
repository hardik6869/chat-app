import { vi } from 'vitest';
import { createChatApi, type ChatApi } from '@/services/api';
import { createSeed } from '@/services/mock-data';
import { createDatabase } from '@/services/mock-server';
import type { RealtimeEvent } from '@/services/realtime';
import { createChatStore } from '@/store/createChatStore';

const NOW = new Date(2026, 10, 11, 15, 30).getTime();

/** Store wired to a zero-latency mock API and a fake realtime client the test controls. */
export function createTestStore(apiOverrides: Partial<ChatApi> = {}) {
  const db = createDatabase(createSeed(NOW));
  const api = { ...createChatApi({ db, latencyMs: 0, failureRate: 0 }), ...apiOverrides };
  const realtime = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  };
  const store = createChatStore({ api, realtime });
  return {
    db,
    api,
    realtime,
    store,
    /** Delivers a server event straight to the store. */
    emit: (event: RealtimeEvent) => {
      store.getState().handleRealtimeEvent(event);
    },
  };
}

/** `createTestStore` with users and conversations already loaded. */
export async function bootstrapTestStore(apiOverrides?: Partial<ChatApi>) {
  const setup = createTestStore(apiOverrides);
  await setup.store.getState().bootstrap();
  return setup;
}
