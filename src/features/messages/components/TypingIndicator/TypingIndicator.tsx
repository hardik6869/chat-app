import { useTypingText } from '../../hooks';

const DOT_DELAYS = ['0s', '0.15s', '0.3s'];

/**
 * Floating pill above the composer. The live region is always mounted so screen readers
 * announce changes; the animated dots are decorative.
 */
export function TypingIndicator({ conversationId }: { conversationId: string }) {
  const text = useTypingText(conversationId);

  return (
    <div aria-live="polite" className="pointer-events-none absolute bottom-3 left-4 md:left-6">
      {text && (
        <p className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs text-text-muted shadow-sm">
          <span aria-hidden className="flex gap-0.5">
            {DOT_DELAYS.map((delay) => (
              <span
                key={delay}
                className="size-1.5 animate-typing rounded-full bg-accent"
                style={{ animationDelay: delay }}
              />
            ))}
          </span>
          {text}
        </p>
      )}
    </div>
  );
}
