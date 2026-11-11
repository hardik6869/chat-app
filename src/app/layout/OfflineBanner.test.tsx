import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { OfflineBanner } from './OfflineBanner';

function goOffline(offline: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: !offline });
  act(() => {
    window.dispatchEvent(new Event(offline ? 'offline' : 'online'));
  });
}

describe('OfflineBanner', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'onLine');
  });

  it('appears while offline and hides when back online', async () => {
    const { container } = render(<OfflineBanner />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();

    goOffline(true);
    expect(screen.getByRole('status')).toHaveTextContent(
      "You're offline. Messages will send when you reconnect.",
    );
    await expectNoA11yViolations(container);

    goOffline(false);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
