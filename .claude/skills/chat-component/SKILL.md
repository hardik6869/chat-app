---
name: chat-component
description: Conventions for creating or editing UI components in this chat app (atomic design, design tokens, variants, barrels, tests). Use whenever adding or changing a component under src/shared/ui or src/features.
---

# Building a component

## 1. Pick the level
| Level     | Location                         | Rule                                                     |
| --------- | -------------------------------- | -------------------------------------------------------- |
| Atom      | `src/shared/ui/atoms/<Name>/`    | No other UI imports except `cn`; purely presentational   |
| Molecule  | `src/shared/ui/molecules/<Name>/`| Composes atoms; no store, no services                    |
| Organism  | `src/features/<feature>/components/<Name>/` | Composes molecules; data comes from feature hooks |

Check `src/shared/ui/index.ts` first — reuse an existing component before making a new one.

## 2. File layout
```
<Name>/
  <Name>.tsx        component (≤ 200 lines)
  <Name>.test.tsx   behavior test
  index.ts          export { <Name> } from './<Name>'; export type { <Name>Props } from './<Name>';
```
Then add it to the parent barrel (`atoms/index.ts`, `components/index.ts`, …).

## 3. Component template
```tsx
import { memo, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/shared/lib';

const sizes = { sm: 'h-8 px-2 text-sm', md: 'h-10 px-3 text-sm', lg: 'h-12 px-4 text-base' } as const;
const variants = {
  primary: 'bg-primary text-primary-fg hover:bg-primary/90',
  ghost: 'bg-transparent text-text hover:bg-surface-muted',
} as const;

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
}

export const Button = memo(function Button({ size = 'md', variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn('inline-flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50', sizes[size], variants[variant], className)}
      {...props}
    />
  );
});
```

## 4. Rules
- Colors come from tokens only (`bg-surface`, `text-muted`, `border-border`, `bg-bubble-out`). No hex values.
- Sizes are `sm | md | lg`; variants are named the same way across atoms.
- Mobile first: base classes target phones, then `md:` (tablet) and `xl:` (desktop).
- Accessibility: icon-only buttons need `aria-label`; lists use `role="list"`; overlays close on Esc and
  restore focus; keep a visible focus ring.
- Icons come from `lucide-react` only, with `aria-hidden` when decorative.
- Pass callbacks as stable props (`useCallback` in the hook). Wrap list items in `memo`.
- No business logic in components. Derive state in hooks or selectors.

## 5. Test
Use `@testing-library/react` + `user-event`. Test behavior (what the user sees and does), not class names.
```tsx
it('calls onClick', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Send</Button>);
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(onClick).toHaveBeenCalledOnce();
});
```
