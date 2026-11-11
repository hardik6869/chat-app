import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '@/shared/ui';

let shouldThrow = true;

function Fragile() {
  if (shouldThrow) throw new Error('boom');
  return <p>Recovered</p>;
}

describe('ErrorBoundary', () => {
  it('shows a fallback with retry, and recovers', async () => {
    const onCaughtError = vi.fn();
    render(
      <ErrorBoundary title="Couldn't show this">
        <Fragile />
      </ErrorBoundary>,
      { onCaughtError },
    );

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't show this");
    expect(onCaughtError).toHaveBeenCalled();

    shouldThrow = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
});
