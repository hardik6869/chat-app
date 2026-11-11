import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Send } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { Button, IconButton } from '@/shared/ui';

describe('Button', () => {
  it('is a non-submitting button that reports clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });

    await userEvent.click(button);

    expect(button).toHaveAttribute('type', 'button');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled and busy while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading disabled={false} onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });

    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('has no accessibility violations in every variant', async () => {
    const { container } = render(
      <div>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost" size="sm">
          Ghost
        </Button>
        <Button variant="danger">Delete</Button>
      </div>,
    );

    await expectNoA11yViolations(container);
  });
});

describe('IconButton', () => {
  it('uses the label as its accessible name and tooltip', async () => {
    const onClick = vi.fn();
    render(<IconButton icon={Send} label="Send message" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Send message' });

    await userEvent.click(button);

    expect(button).toHaveAttribute('title', 'Send message');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <IconButton icon={Send} label="Send message" variant="primary" size="sm" />,
    );

    await expectNoA11yViolations(container);
  });
});
