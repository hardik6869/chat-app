import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { SearchInput } from '@/shared/ui';

function ControlledSearch() {
  const [value, setValue] = useState('');
  return <SearchInput label="Search conversations" value={value} onValueChange={setValue} />;
}

describe('SearchInput', () => {
  it('types, clears with the button and keeps focus in the field', async () => {
    render(<ControlledSearch />);
    const input = screen.getByRole('searchbox', { name: 'Search conversations' });

    await userEvent.type(input, 'ava');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
  });

  it('clears on Escape', async () => {
    render(<ControlledSearch />);
    const input = screen.getByRole('searchbox');

    await userEvent.type(input, 'ava{Escape}');

    expect(input).toHaveValue('');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SearchInput label="Search" value="ava" onValueChange={vi.fn()} />,
    );

    await expectNoA11yViolations(container);
  });
});
