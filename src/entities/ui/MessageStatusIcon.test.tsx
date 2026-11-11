import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { MessageStatusIcon } from '@/entities';

describe('MessageStatusIcon', () => {
  it.each([
    ['sending', 'Sending'],
    ['sent', 'Sent'],
    ['delivered', 'Delivered'],
    ['read', 'Read'],
    ['failed', 'Failed to send'],
  ] as const)('labels %s as "%s"', (status, label) => {
    render(<MessageStatusIcon status={status} />);

    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it('highlights read receipts in teal for each background', () => {
    render(
      <>
        <MessageStatusIcon status="read" tone="bubble" />
        <MessageStatusIcon status="read" tone="surface" />
        <MessageStatusIcon status="delivered" tone="bubble" />
      </>,
    );
    const [inBubble, onSurface, delivered] = screen.getAllByRole('img');

    expect(inBubble).toHaveClass('text-read');
    expect(onSurface).toHaveClass('text-accent');
    expect(delivered).toHaveClass('text-bubble-out-meta');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MessageStatusIcon status="delivered" />);

    await expectNoA11yViolations(container);
  });
});
