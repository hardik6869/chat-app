import { describe, expect, it, vi } from 'vitest';
import { setErrorReporter } from '@/shared/lib';
import { bootstrapTestStore as ready, createTestStore } from '@/test';
import { selectConversationList, selectTotalUnread } from './selectors';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('session', () => {
  it('bootstraps users and conversations', async () => {
    const { store } = await ready();
    const state = store.getState();

    expect(state.bootstrapStatus).toBe('success');
    expect(state.currentUserId).toBe('me');
    expect(state.users.ava?.name).toBe('Ava Patel');
    expect(Object.keys(state.conversations)).toContain('c-design');
  });

  it('reports bootstrap errors', async () => {
    const restore = setErrorReporter(vi.fn());
    const { store } = await ready({ fetchBootstrap: () => Promise.reject(new Error('down')) });

    expect(store.getState().bootstrapStatus).toBe('error');
    restore();
  });

  it('opening a conversation loads messages and marks it read', async () => {
    const { store, db } = await ready();

    store.getState().setActiveConversation('c-ava');
    await flush();

    const state = store.getState();
    expect(state.activeConversationId).toBe('c-ava');
    expect(state.threads['c-ava']?.status).toBe('success');
    expect(state.conversations['c-ava']?.unreadCount).toBe(0);
    expect(db.conversations.get('c-ava')?.unreadCount).toBe(0);
  });

  it('adds and removes group members', async () => {
    const { store } = await ready();

    await store.getState().addMember('c-trip', 'ava');
    expect(store.getState().conversations['c-trip']?.memberIds).toContain('ava');

    await store.getState().removeMember('c-trip', 'ava');
    expect(store.getState().conversations['c-trip']?.memberIds).not.toContain('ava');
  });
});

describe('selectors and drafts', () => {
  it('filters, searches and sorts conversations by recent activity', async () => {
    const { store } = await ready();
    const state = store.getState();
    const ids = (filter: 'all' | 'unread' | 'groups', query = '') =>
      selectConversationList(state, filter, query).map((c) => c.id);

    expect(ids('all')[0]).toBe('c-design');
    expect(ids('unread')).toEqual(['c-design', 'c-ava', 'c-priya']);
    expect(ids('groups')).toEqual(['c-design', 'c-engineering', 'c-trip']);
    expect(ids('all', 'ava')).toEqual(['c-ava']);
    expect(ids('all', 'interviews')).toEqual(['c-priya']);
    expect(selectTotalUnread(state)).toBe(6);
  });

  it('stores and clears drafts', () => {
    const { store } = createTestStore();

    store.getState().setDraft('c-ava', 'Half a thought');
    expect(store.getState().drafts).toEqual({ 'c-ava': 'Half a thought' });

    store.getState().setDraft('c-ava', '');
    expect(store.getState().drafts).toEqual({});
  });
});
