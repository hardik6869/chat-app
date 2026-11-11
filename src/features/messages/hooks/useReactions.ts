import { useCallback, useMemo } from 'react';
import { captureError } from '@/shared/lib';
import { toast } from '@/shared/ui';
import { useChatStore } from '@/store';
import { joinNames } from '../lib';

interface ReactionChip {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  /** "Ava Patel and you" */
  people: string;
}

/**
 * Reaction chips for one message and a toggle. Subscribes to stable store references
 * (the message's reactions and the users map) and derives chips with useMemo.
 */
export function useReactions(messageId: string) {
  const reactions = useChatStore((state) => state.messages[messageId]?.reactions);
  const users = useChatStore((state) => state.users);
  const currentUserId = useChatStore((state) => state.currentUserId);
  const toggleReaction = useChatStore((state) => state.toggleReaction);

  const chips = useMemo<ReactionChip[]>(
    () =>
      (reactions ?? []).map(({ emoji, userIds }) => {
        const others = userIds.filter((id) => id !== currentUserId);
        const reactedByMe = others.length !== userIds.length;
        const names = others.map((id) => users[id]?.name ?? 'Someone');
        return {
          emoji,
          count: userIds.length,
          reactedByMe,
          people: joinNames(reactedByMe ? [...names, 'you'] : names),
        };
      }),
    [reactions, users, currentUserId],
  );

  const toggle = useCallback(
    (emoji: string) => {
      toggleReaction(messageId, emoji).catch((error: unknown) => {
        captureError(error, 'toggleReaction');
        toast.error("Couldn't update your reaction");
      });
    },
    [messageId, toggleReaction],
  );

  return { chips, toggle };
}
