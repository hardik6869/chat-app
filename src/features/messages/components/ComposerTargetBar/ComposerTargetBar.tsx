import { X } from 'lucide-react';
import type { ComposerTarget } from '@/store';
import { IconButton } from '@/shared/ui';
import { QuotedMessage } from '../QuotedMessage';

interface ComposerTargetBarProps {
  target: ComposerTarget;
  onCancel: () => void;
}

/** Shown above the composer while replying to (or editing) a message. Esc also cancels. */
export function ComposerTargetBar({ target, onCancel }: ComposerTargetBarProps) {
  const title = target.mode === 'reply' ? 'Replying to' : 'Editing message';

  return (
    <div className="mx-auto mb-2 flex max-w-220 items-start gap-2">
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-text-muted">{title}</p>
        <QuotedMessage messageId={target.messageId} tone="muted" />
      </div>
      <IconButton
        icon={X}
        label={target.mode === 'reply' ? 'Cancel reply' : 'Cancel editing'}
        size="sm"
        onClick={onCancel}
      />
    </div>
  );
}
