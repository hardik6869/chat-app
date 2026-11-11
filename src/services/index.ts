import { createChatApi } from './api';
import { createPersistentDatabase } from './mock-server';
import { createRealtimeSimulator } from './realtime';

/**
 * Composition root of the mock backend: one shared database for the API and the realtime
 * simulator, saved to localStorage. Swapping in a real backend only changes this file.
 */
const persistence = createPersistentDatabase();
window.addEventListener('pagehide', () => {
  persistence.flush();
});

export const chatApi = createChatApi({ db: persistence.db });
export const realtime = createRealtimeSimulator(persistence.db);

export type { ChatApi } from './api';
export type { RealtimeClient, RealtimeEvent } from './realtime';
