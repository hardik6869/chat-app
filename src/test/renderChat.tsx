import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { ChatWindow } from '@/features/messages';

/**
 * jsdom has no layout: give scroll areas (client size) and rows (offset size) real sizes so
 * the virtualized list renders rows. Call in `beforeEach` (spies are restored after each test).
 */
export function mockLayout() {
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(800);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(60);
}

/** Renders a full conversation (header, messages, composer) inside a router. */
export function renderChat(conversationId: string) {
  return render(
    <MemoryRouter initialEntries={[`/c/${conversationId}`]}>
      <ChatWindow conversationId={conversationId} />
    </MemoryRouter>,
  );
}
