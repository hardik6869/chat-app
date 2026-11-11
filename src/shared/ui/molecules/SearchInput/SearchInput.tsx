import { Search, X } from 'lucide-react';
import { useRef, type ComponentProps, type RefObject } from 'react';
import { cn } from '@/shared/lib';
import { IconButton, Input } from '../../atoms';

export interface SearchInputProps extends Omit<
  ComponentProps<'input'>,
  'value' | 'onChange' | 'type' | 'ref'
> {
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name of the field. */
  label: string;
  /** Lets a parent focus the field, e.g. from a keyboard shortcut. */
  ref?: RefObject<HTMLInputElement | null>;
}

/** Search field with icon, clear button and Esc-to-clear. Focus stays in the field after clearing. */
export function SearchInput({
  value,
  onValueChange,
  label,
  className,
  ref,
  ...props
}: SearchInputProps) {
  const ownRef = useRef<HTMLInputElement>(null);
  const inputRef = ref ?? ownRef;

  const clear = () => {
    onValueChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
      />
      <Input
        ref={inputRef}
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.preventDefault();
            clear();
          }
        }}
        className="pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {value && (
        <IconButton
          icon={X}
          label="Clear search"
          size="sm"
          onClick={clear}
          className="absolute top-1/2 right-1 -translate-y-1/2"
        />
      )}
    </div>
  );
}
