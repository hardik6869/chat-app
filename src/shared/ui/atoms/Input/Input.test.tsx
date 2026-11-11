import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { Input } from '@/shared/ui';

describe('Input', () => {
  it('accepts typing', async () => {
    render(<Input aria-label="Name" />);
    const input = screen.getByRole('textbox', { name: 'Name' });

    await userEvent.type(input, 'Ava');

    expect(input).toHaveValue('Ava');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('marks invalid fields for assistive tech', () => {
    render(<Input aria-label="Name" invalid />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="name">Name</label>
        <Input id="name" />
      </div>,
    );

    await expectNoA11yViolations(container);
  });
});
