import type { SliceCreator, UiSlice } from '../types';

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  drafts: {},

  setDraft(conversationId, text) {
    set((state) => ({
      drafts: text
        ? { ...state.drafts, [conversationId]: text }
        : Object.fromEntries(Object.entries(state.drafts).filter(([id]) => id !== conversationId)),
    }));
  },
});
