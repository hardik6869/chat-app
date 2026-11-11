import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Inbox } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { Button, EmptyState, ErrorState } from '@/shared/ui';

describe('EmptyState / ErrorState', () => {
  it('shows title, description and action', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No conversations"
        description="Start a new chat."
        action={<Button>New chat</Button>}
      />,
    );

    expect(screen.getByText('No conversations')).toBeInTheDocument();
    expect(screen.getByText('Start a new chat.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New chat' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('announces errors and retries', async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <EmptyState icon={Inbox} title="Nothing here" />
        <ErrorState onRetry={vi.fn()} />
      </div>,
    );

    await expectNoA11yViolations(container);
  });
});
