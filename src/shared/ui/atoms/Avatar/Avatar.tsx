import { useState } from 'react';
import { cn } from '@/shared/lib';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<AvatarSize, { box: string; text: string; dot: string }> = {
  sm: { box: 'size-8', text: 'text-xs', dot: 'size-2.5' },
  md: { box: 'size-10', text: 'text-sm', dot: 'size-3' },
  lg: { box: 'size-11', text: 'text-base', dot: 'size-3' },
  xl: { box: 'size-20', text: 'text-2xl', dot: 'size-4' },
};

/** Static class names so Tailwind can see them. Picked by hashing the name. */
const tints = [
  'bg-avatar-1-bg text-avatar-1-fg',
  'bg-avatar-2-bg text-avatar-2-fg',
  'bg-avatar-3-bg text-avatar-3-fg',
  'bg-avatar-4-bg text-avatar-4-fg',
  'bg-avatar-5-bg text-avatar-5-fg',
  'bg-avatar-6-bg text-avatar-6-fg',
] as const;

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

function tintFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return tints[hash % tints.length] ?? tints[0];
}

export interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  /** Shows a presence dot; also added to the accessible name. */
  online?: boolean;
  className?: string;
}

export function Avatar({ name, src, size = 'md', online, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = src !== undefined && src !== failedSrc;
  const { box, text, dot } = sizes[size];

  return (
    <span
      role="img"
      aria-label={online ? `${name}, online` : name}
      className={cn('relative inline-flex shrink-0', box, className)}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => {
            setFailedSrc(src);
          }}
          className="size-full rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            'flex size-full items-center justify-center rounded-full font-semibold',
            text,
            tintFor(name),
          )}
        >
          {initials(name)}
        </span>
      )}
      {online && (
        <span
          aria-hidden
          className={cn(
            'absolute right-0 bottom-0 rounded-full bg-online ring-2 ring-surface',
            dot,
          )}
        />
      )}
    </span>
  );
}
