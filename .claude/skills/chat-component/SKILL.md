---
name: chat-component
description: Conventions for creating or editing UI components in this chat app (atomic design, design tokens, variants, barrels, tests). Use whenever adding or changing a component under src/shared/ui or src/features.
---

# Building a component

## 1. Pick the level

| Level    | Location                                    | Rule                                                   |
| -------- | ------------------------------------------- | ------------------------------------------------------ |
| Atom     | `src/shared/ui/atoms/<Name>/`               | No other UI imports except `cn`; purely presentational |
| Molecule | `src/shared/ui/molecules/<Name>/`           | Composes atoms; no store, no services                  |
| Organism | `src/features/<feature>/components/<Name>/` | Composes molecules; data comes from feature hooks      |

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

const sizes = {
  sm: 'h-8 px-2 text-sm',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
} as const;
const variants = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  ghost: 'bg-transparent text-text hover:bg-surface-muted',
} as const;

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
}

export const Button = memo(function Button({
  size = 'md',
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-md disabled:opacity-50',
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
```

## 4. Look & layout (simple, professional, colored)

- Palette: indigo brand (`primary`), teal accent (`accent`), soft tinted neutrals (`bg`, `surface`,
  `surface-muted`, `surface-active`). Not black-and-white; no gradients, one shadow level (`shadow-sm`).
- Chat canvas is `bg-surface-muted`; my bubbles `bg-bubble-out text-primary-fg`; others `bg-bubble-in`.
- Fixed rhythm: 64 px headers, 72 px conversation rows, 44 px list avatars, 20 px icons (16 px in meta),
  4 px spacing grid (2/3/4/6), radius `md` controls / `lg` bubbles / `full` avatars and badges.
- No wasted space: bubbles ≤ 75 % width, message column ≤ 880 px, one-line ellipsis previews,
  message actions in one compact pill shown on hover/focus/long-press.

## 5. WCAG 2.2 AA (required)

- Only use token pairs from the design system (all ≥ 4.5:1 text, ≥ 3:1 UI). Inputs use `border-strong`.
- Never color alone: unread = bold + badge, online = dot + text, status ticks have `aria-label`.
- Targets ≥ 40 px (44 px on touch). Focus ring is global (`:focus-visible` in `styles.css`); never remove outlines.
- Live updates (`aria-live="polite"`): new messages, typing, toasts. Respect `motion-reduce:`.
- Add a `vitest-axe` assertion (`expect(await axe(container)).toHaveNoViolations()`) to organism tests.

## 6. Rules

- Colors come from tokens only (`bg-surface`, `text-text-muted`, `border-border`, `bg-bubble-out`). No hex values.
- Sizes are `sm | md | lg`; variants are named the same way across atoms.
- Mobile first: base classes target phones, then `md:` (tablet) and `xl:` (desktop).
- Accessibility: icon-only buttons need `aria-label`; lists use `role="list"`; overlays close on Esc and
  restore focus; keep a visible focus ring.
- Icons come from `lucide-react` only, with `aria-hidden` when decorative.
- Pass callbacks as stable props (`useCallback` in the hook). Wrap list items in `memo`.
- No business logic in components. Derive state in hooks or selectors.

## 7. Test

Use `@testing-library/react` + `user-event`. Test behavior (what the user sees and does), not class names.

```tsx
it('calls onClick', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Send</Button>);
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(onClick).toHaveBeenCalledOnce();
});
```
