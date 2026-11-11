import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { ChipGroup } from '@/shared/ui';

describe('ChipGroup', () => {
  const options = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'groups', label: 'Groups' },
  ] as const;

  it('marks the selected chip and reports changes', async () => {
    const onChange = vi.fn();
    render(<ChipGroup label="Filter" options={options} value="all" onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Unread' })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(screen.getByRole('button', { name: 'Groups' }));
    expect(onChange).toHaveBeenCalledWith('groups');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ChipGroup label="Filter" options={options} value="unread" onChange={vi.fn()} />,
    );

    await expectNoA11yViolations(container);
  });
});
