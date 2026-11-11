import { Check, CheckCheck, CircleAlert, Clock, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib';
import type { MessageStatus } from '../message';

const icons: Record<MessageStatus, { icon: LucideIcon; label: string }> = {
  sending: { icon: Clock, label: 'Sending' },
  sent: { icon: Check, label: 'Sent' },
  delivered: { icon: CheckCheck, label: 'Delivered' },
  read: { icon: CheckCheck, label: 'Read' },
  failed: { icon: CircleAlert, label: 'Failed to send' },
};

/** Colors per background; each pair is contrast-checked in tokens.test.ts. */
const tones = {
  /** Inside my indigo bubble. */
  bubble: { base: 'text-bubble-out-meta', read: 'text-read', failed: 'text-bubble-out-meta' },
  /** On surfaces such as the conversation list. */
  surface: { base: 'text-text-muted', read: 'text-accent', failed: 'text-danger' },
} as const;

interface MessageStatusIconProps {
  status: MessageStatus;
  tone?: keyof typeof tones;
  className?: string;
}

/** ✓ sent · ✓✓ delivered · teal ✓✓ read · clock while sending. Labelled for screen readers. */
export function MessageStatusIcon({ status, tone = 'surface', className }: MessageStatusIconProps) {
  const { icon: Icon, label } = icons[status];
  const colors = tones[tone];
  const color = status === 'read' ? colors.read : status === 'failed' ? colors.failed : colors.base;

  return <Icon role="img" aria-label={label} className={cn('size-4 shrink-0', color, className)} />;
}
