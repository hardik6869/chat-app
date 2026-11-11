import { useEffect, useRef, useState } from 'react';
import { MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS, type Attachment } from '@/entities';
import { createId, formatFileSize } from '@/shared/lib';
import { toast } from '@/shared/ui';

/**
 * Files picked in the composer, previewed with object URLs. Removed or unsent previews are
 * revoked (no memory leaks); sent ones stay alive for the session because messages use them.
 */
export function useAttachments() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const pendingRef = useRef<Attachment[]>([]);

  useEffect(() => {
    pendingRef.current = attachments;
  }, [attachments]);

  useEffect(
    () => () => {
      pendingRef.current.forEach((attachment) => {
        URL.revokeObjectURL(attachment.url);
      });
    },
    [],
  );

  const add = (files: Iterable<File>) => {
    const accepted: Attachment[] = [];
    for (const file of files) {
      if (attachments.length + accepted.length >= MAX_ATTACHMENTS) {
        toast.error(`You can attach up to ${MAX_ATTACHMENTS} files`);
        break;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`${file.name} is larger than ${formatFileSize(MAX_ATTACHMENT_BYTES)}`);
        continue;
      }
      accepted.push({
        id: createId('file'),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      });
    }
    if (accepted.length > 0) setAttachments((current) => [...current, ...accepted]);
  };

  const remove = (id: string) => {
    const target = attachments.find((attachment) => attachment.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  };

  /** After sending: hand the previews over to the message (no revoke). */
  const takeAll = () => {
    const taken = attachments;
    pendingRef.current = [];
    setAttachments([]);
    return taken;
  };

  return { attachments, add, remove, takeAll };
}
