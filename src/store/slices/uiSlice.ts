import type { SliceCreator, UiSlice } from '../types';

const without = <T>(record: Record<string, T>, key: string) =>
  Object.fromEntries(Object.entries(record).filter(([id]) => id !== key));

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  drafts: {},
  composerTargets: {},

  setDraft(conversationId, text) {
    set((state) => ({
      drafts: text
        ? { ...state.drafts, [conversationId]: text }
        : without(state.drafts, conversationId),
    }));
  },

  setComposerTarget(conversationId, target) {
    set((state) => ({
      composerTargets: target
        ? { ...state.composerTargets, [conversationId]: target }
        : without(state.composerTargets, conversationId),
    }));
  },
});
