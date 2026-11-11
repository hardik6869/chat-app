function readNumber(raw: string | undefined, fallback: number, min: number, max: number) {
  const value = Number(raw);
  return raw === undefined || raw === '' || Number.isNaN(value)
    ? fallback
    : Math.min(max, Math.max(min, value));
}

/** Mock backend settings from `VITE_*` env vars, clamped to safe ranges. */
export const mockConfig = {
  latencyMs: readNumber(import.meta.env.VITE_MOCK_LATENCY_MS, 400, 0, 10_000),
  failureRate: readNumber(import.meta.env.VITE_MOCK_FAILURE_RATE, 0, 0, 1),
};
