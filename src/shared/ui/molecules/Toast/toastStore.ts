import { useSyncExternalStore } from 'react';
import { createId } from '@/shared/lib';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

const MAX_VISIBLE = 3;
let toasts: readonly ToastItem[] = [];
const listeners = new Set<() => void>();

function setToasts(next: readonly ToastItem[]) {
  toasts = next;
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function show(message: string, tone: ToastTone = 'info'): string {
  const id = createId('toast');
  setToasts([...toasts, { id, message, tone }].slice(-MAX_VISIBLE));
  return id;
}

/** Imperative API usable from anywhere (hooks, services): `toast.success('Copied')`. */
export const toast = {
  show,
  success: (message: string) => show(message, 'success'),
  error: (message: string) => show(message, 'error'),
  dismiss: (id: string) => {
    setToasts(toasts.filter((item) => item.id !== id));
  },
  clear: () => {
    setToasts([]);
  },
};

export function useToasts(): readonly ToastItem[] {
  return useSyncExternalStore(subscribe, () => toasts);
}
