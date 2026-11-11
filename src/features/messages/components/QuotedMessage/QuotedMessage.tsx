import { cn } from '@/shared/lib';
import { useQuotedMessage } from '../../hooks';

/** Each tone's pairs are contrast-checked in tokens.test.ts. */
const tones = {
  /** Inside my indigo bubble. */
  own: {
    box: 'border-read bg-primary-hover',
    name: 'text-bubble-out-meta',
    text: 'text-primary-fg',
  },
  /** Inside others' bubbles and in the composer bar. */
  muted: {
    box: 'border-accent bg-surface-muted',
    name: 'text-primary-text',
    text: 'text-text-muted',
  },
} as const;

interface QuotedMessageProps {
  messageId: string;
  tone: keyof typeof tones;
  className?: string;
}

/** Sender + two-line snippet of the message being replied to, with an accent bar. */
export function QuotedMessage({ messageId, tone, className }: QuotedMessageProps) {
  const { sender, text } = useQuotedMessage(messageId);
  const colors = tones[tone];

  return (
    <blockquote
      className={cn('min-w-0 rounded-md border-l-2 px-2.5 py-1.5 text-xs', colors.box, className)}
    >
      <p className={cn('font-semibold', colors.name)}>{sender}</p>
      <p className={cn('line-clamp-2 wrap-anywhere', colors.text)}>{text}</p>
    </blockquote>
  );
}
