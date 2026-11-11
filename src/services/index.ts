import { createChatApi } from './api';
import { createPersistentDatabase, type Database } from './mock-server';
import { createRealtimeSimulator } from './realtime';

/**
 * Composition root of the mock backend: one shared database for the API and the realtime
 * simulator, saved to localStorage. Swapping in a real backend only changes this file.
 */
let persistence: ReturnType<typeof createPersistentDatabase> | undefined;

/**
 * The database is created on first use (the first API call), not when this module loads,
 * so building or restoring 10,000 messages doesn't delay the app's first paint.
 */
const db = new Proxy({} as Database, {
  get: (_target, key) => {
    persistence ??= createPersistentDatabase();
    return Reflect.get(persistence.db, key) as unknown;
  },
});

window.addEventListener('pagehide', () => {
  persistence?.flush();
});

export const chatApi = createChatApi({ db });
export const realtime = createRealtimeSimulator(db);

export type { ChatApi } from './api';
export type { RealtimeClient, RealtimeEvent } from './realtime';
