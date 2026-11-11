import { useEffect } from 'react';
import { startRealtime, useChatStore } from '@/store';

/** Loads the session once and keeps realtime connected while the app is mounted. */
export function useChatSession() {
  const status = useChatStore((state) => state.bootstrapStatus);
  const bootstrap = useChatStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => startRealtime(), []);

  return { isError: status === 'error', retry: bootstrap };
}
