import { captureError } from './captureError';

/**
 * localStorage that never throws: private mode, disabled storage and quota errors
 * are reported and treated as "nothing stored". Matches Zustand's `StateStorage` shape.
 */
export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      captureError(error, `storage.getItem(${key})`);
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      captureError(error, `storage.setItem(${key})`);
    }
  },

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      captureError(error, `storage.removeItem(${key})`);
    }
  },
};
