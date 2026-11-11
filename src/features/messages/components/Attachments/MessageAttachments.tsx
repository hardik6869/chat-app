import { Download, FileText } from 'lucide-react';
import { useState } from 'react';
import type { Attachment } from '@/entities';
import { cn, formatFileSize } from '@/shared/lib';

/** A downloadable file chip. Also the fallback when an image can't be shown. */
function FileChip({ attachment, isOwn }: { attachment: Attachment; isOwn: boolean }) {
  return (
    <a
      href={attachment.url}
      download={attachment.name}
      className={cn(
        'flex max-w-60 items-center gap-2 rounded-md px-2.5 py-2 text-xs',
        isOwn ? 'bg-primary-hover text-primary-fg' : 'bg-surface-muted text-text',
      )}
    >
      <FileText aria-hidden className="size-5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{attachment.name}</span>
        <span className={isOwn ? 'text-bubble-out-meta' : 'text-text-muted'}>
          {formatFileSize(attachment.size)}
        </span>
      </span>
      <Download aria-hidden className="size-4 shrink-0" />
    </a>
  );
}

function ImageAttachment({ attachment, isOwn }: { attachment: Attachment; isOwn: boolean }) {
  // Object URLs only live for the session; after a reload fall back to the file chip.
  const [broken, setBroken] = useState(false);
  if (broken) return <FileChip attachment={attachment} isOwn={isOwn} />;

  return (
    <img
      src={attachment.url}
      alt={attachment.name}
      loading="lazy"
      onError={() => {
        setBroken(true);
      }}
      className="max-h-60 max-w-60 rounded-md object-cover"
    />
  );
}

/** Images and files at the top of a bubble. */
export function MessageAttachments({
  attachments,
  isOwn,
}: {
  attachments: readonly Attachment[];
  isOwn: boolean;
}) {
  return (
    <div className="mb-1.5 flex flex-col gap-1.5">
      {attachments.map((attachment) =>
        attachment.type.startsWith('image/') ? (
          <ImageAttachment key={attachment.id} attachment={attachment} isOwn={isOwn} />
        ) : (
          <FileChip key={attachment.id} attachment={attachment} isOwn={isOwn} />
        ),
      )}
    </div>
  );
}
