import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe-core on a rendered container and fails with a readable list of violations.
 * `color-contrast` is skipped because jsdom has no layout; contrast is verified on the design tokens.
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const { violations } = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });

  expect(violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}
