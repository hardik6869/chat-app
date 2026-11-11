import { cn } from '@/shared/lib';
import { useReactions } from '../../hooks';

/** Chips under a bubble: emoji + count. Mine are highlighted; clicking toggles my reaction. */
export function ReactionChips({ messageId }: { messageId: string }) {
  const { chips, toggle } = useReactions(messageId);
  if (chips.length === 0) return null;

  return (
    <ul aria-label="Reactions" className="flex flex-wrap gap-1">
      {chips.map((chip) => (
        <li key={chip.emoji}>
          <button
            type="button"
            aria-pressed={chip.reactedByMe}
            aria-label={`${chip.emoji} ${chip.count}, reacted by ${chip.people}`}
            title={chip.people}
            onClick={() => {
              toggle(chip.emoji);
            }}
            className={cn(
              'inline-flex h-7 items-center gap-1 rounded-full border px-2 text-xs font-medium transition-colors pointer-coarse:h-9',
              chip.reactedByMe
                ? 'border-primary bg-surface-active text-primary-text'
                : 'border-border bg-surface text-text-muted hover:bg-surface-muted',
            )}
          >
            <span aria-hidden>{chip.emoji}</span>
            <span aria-hidden className="tabular-nums">
              {chip.count}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
