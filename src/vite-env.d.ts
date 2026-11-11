/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Average mock API delay in ms (default 400). */
  readonly VITE_MOCK_LATENCY_MS?: string;
  /** Chance (0–1) that a mock request fails, to exercise error states (default 0). */
  readonly VITE_MOCK_FAILURE_RATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
