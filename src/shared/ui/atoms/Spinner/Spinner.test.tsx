import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { Skeleton, Spinner } from '@/shared/ui';

describe('Spinner', () => {
  it('announces loading with a custom label', () => {
    render(<Spinner label="Loading messages" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading messages');
  });

  it('is silent when the parent already announces loading', () => {
    render(<Spinner label={null} />);

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Spinner />);

    await expectNoA11yViolations(container);
  });
});

describe('Skeleton', () => {
  it('is hidden from assistive tech', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstChild).toHaveClass('h-4', 'w-20');
  });
});
