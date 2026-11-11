import { Component, type ReactNode } from 'react';
import { ErrorState } from '../EmptyState';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Shown in the fallback, e.g. "Couldn't show this conversation". */
  title?: string;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Contains render errors to one area of the UI and offers "Try again".
 * Errors are reported via `createRoot({ onCaughtError })` in `main.tsx`.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private readonly reset = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <ErrorState
        title={this.props.title}
        description="Something unexpected happened here. The rest of the app still works."
        onRetry={this.reset}
        className={this.props.className}
      />
    );
  }
}
