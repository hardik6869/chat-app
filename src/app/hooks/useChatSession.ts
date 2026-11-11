import { useEffect } from 'react';
import { startRealtime, useChatStore } from '@/store';

/** Loads the session once and keeps realtime connected while the app is mounted. */
export function useChatSession() {
  const status = useChatStore((state) => state.bootstrapStatus);
  const bootstrap = useChatStore((state) => state.bootstrap);
  const flushOutbox = useChatStore((state) => state.flushOutbox);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => startRealtime(), []);

  // Send messages queued while offline as soon as the connection is back.
  useEffect(() => {
    const handleOnline = () => {
      void flushOutbox();
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [flushOutbox]);

  return { isError: status === 'error', retry: bootstrap };
}
