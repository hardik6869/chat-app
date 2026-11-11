interface ErrorReport {
  error: unknown;
  context?: string;
  timestamp: number;
}

type ErrorReporter = (report: ErrorReport) => void;

let reporter: ErrorReporter = () => undefined;

/**
 * Plugs in where errors go (e.g. Sentry in production, a toast in the UI).
 * Returns a function that restores the previous reporter.
 */
export function setErrorReporter(next: ErrorReporter): () => void {
  const previous = reporter;
  reporter = next;
  return () => {
    reporter = previous;
  };
}

/** Single place the app sends handled errors to — instead of `console.error`. */
export function captureError(error: unknown, context?: string): void {
  reporter({ error, context, timestamp: Date.now() });
}
