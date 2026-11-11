import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { Badge } from '@/shared/ui';

describe('Badge', () => {
  it('shows the count with screen-reader text', () => {
    render(<Badge count={3} label="3 unread messages" />);

    expect(screen.getByText('3', { selector: '[aria-hidden]' })).toBeInTheDocument();
    expect(screen.getByText('3 unread messages')).toHaveClass('sr-only');
  });

  it('caps large counts', () => {
    render(<Badge count={150} />);

    expect(screen.getByText('99+')).toBeInTheDocument();
    expect(screen.getByText('150')).toHaveClass('sr-only');
  });

  it('renders nothing for zero', () => {
    const { container } = render(<Badge count={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Badge count={5} label="5 unread messages" />);

    await expectNoA11yViolations(container);
  });
});
