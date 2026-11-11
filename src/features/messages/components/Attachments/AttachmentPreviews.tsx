import { FileText, X } from 'lucide-react';
import type { Attachment } from '@/entities';
import { formatFileSize } from '@/shared/lib';
import { IconButton } from '@/shared/ui';

interface AttachmentPreviewsProps {
  attachments: readonly Attachment[];
  onRemove: (id: string) => void;
}

/** Files waiting to be sent: image thumbnails and file chips, each removable. */
export function AttachmentPreviews({ attachments, onRemove }: AttachmentPreviewsProps) {
  if (attachments.length === 0) return null;

  return (
    <ul aria-label="Attachments" className="mx-auto mb-2 flex max-w-220 flex-wrap gap-2">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className="relative flex h-16 items-center gap-2 rounded-md border border-border bg-surface-muted pr-9 pl-1"
        >
          {attachment.type.startsWith('image/') ? (
            <img src={attachment.url} alt="" className="size-14 rounded-sm object-cover" />
          ) : (
            <FileText aria-hidden className="ml-2 size-6 text-text-muted" />
          )}
          <span className="max-w-36 text-xs">
            <span className="block truncate font-medium text-text">{attachment.name}</span>
            <span className="text-text-muted">{formatFileSize(attachment.size)}</span>
          </span>
          <IconButton
            icon={X}
            label={`Remove ${attachment.name}`}
            size="sm"
            onClick={() => {
              onRemove(attachment.id);
            }}
            className="absolute top-1 right-1"
          />
        </li>
      ))}
    </ul>
  );
}
