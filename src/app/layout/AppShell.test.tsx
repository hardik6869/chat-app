import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';

const shell = (hasSelection: boolean) => (
  <AppShell sidebar={<p>list</p>} hasSelection={hasSelection}>
    <p>chat</p>
  </AppShell>
);

describe('AppShell focus on phones', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('moves focus to the pane that appears, but not on first load', () => {
    const { rerender, container } = render(shell(false));
    expect(document.body).toHaveFocus();

    rerender(shell(true));
    expect(container.querySelector('main')).toHaveFocus();

    rerender(shell(false));
    expect(container.querySelector('nav')).toHaveFocus();
  });

  it('leaves focus alone on wider layouts', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    const { rerender } = render(shell(false));

    rerender(shell(true));

    expect(document.body).toHaveFocus();
  });
});
