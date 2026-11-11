import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { toast, Toaster } from '@/shared/ui';

describe('Toaster', () => {
  afterEach(() => {
    act(() => {
      toast.clear();
    });
    vi.useRealTimers();
  });

  it('shows status and error toasts, and dismisses them', async () => {
    render(<Toaster />);

    act(() => {
      toast.success('Copied to clipboard');
      toast.error('Message failed to send');
    });

    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
    expect(screen.getByRole('alert')).toHaveTextContent('Message failed to send');

    const [firstToast] = screen.getAllByRole('listitem');
    if (!firstToast) throw new Error('Expected a toast');
    await userEvent.click(within(firstToast).getByRole('button', { name: 'Dismiss notification' }));

    expect(screen.queryByText('Copied to clipboard')).toBeNull();
    expect(screen.getByText('Message failed to send')).toBeInTheDocument();
  });

  it('keeps at most three toasts and auto-dismisses them', () => {
    vi.useFakeTimers();
    render(<Toaster />);

    act(() => {
      ['one', 'two', 'three', 'four'].forEach((message) => toast.show(message));
    });
    expect(screen.queryByText('one')).toBeNull();
    expect(screen.getAllByRole('status')).toHaveLength(3);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryAllByRole('status')).toHaveLength(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Toaster />);
    act(() => {
      toast.show('Saved');
    });

    await expectNoA11yViolations(container);
  });
});
