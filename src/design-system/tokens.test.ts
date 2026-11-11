import { describe, expect, it } from 'vitest';
import tokensCss from './tokens.css?raw';

type Palette = Record<string, string>;

function parseBlock(selector: string): Palette {
  const block =
    new RegExp(`${selector.replace('.', '\\.')}\\s*{([^}]*)}`).exec(tokensCss)?.[1] ?? '';
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m): [string, string] => [
      m[1] ?? '',
      m[2] ?? '',
    ]),
  );
}

function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = 4.5;
const NON_TEXT = 3;

/** [foreground, background, minimum ratio] for every pairing used in the UI. */
const pairs: [string, string, number][] = [
  ['text', 'bg', TEXT],
  ['text', 'surface', TEXT],
  ['text', 'surface-muted', TEXT],
  ['text', 'surface-active', TEXT],
  ['text', 'bubble-in', TEXT],
  ['text-muted', 'bg', TEXT],
  ['text-muted', 'surface', TEXT],
  ['text-muted', 'surface-muted', TEXT],
  ['text-muted', 'bubble-in', TEXT],
  ['primary-fg', 'primary', TEXT],
  ['primary-fg', 'primary-hover', TEXT],
  ['primary-text', 'surface', TEXT],
  ['primary-text', 'surface-active', TEXT],
  ['primary-fg', 'bubble-out', TEXT],
  ['bubble-out-meta', 'bubble-out', TEXT],
  ['read', 'bubble-out', NON_TEXT],
  ['accent', 'surface', TEXT],
  ['accent', 'surface-muted', TEXT],
  ['danger', 'surface', TEXT],
  ['danger-fg', 'danger', TEXT],
  ['border-strong', 'surface', NON_TEXT],
  ['online', 'surface', NON_TEXT],
  ['focus', 'bg', NON_TEXT],
  ['focus', 'surface', NON_TEXT],
  ...[1, 2, 3, 4, 5, 6].map((n): [string, string, number] => [
    `avatar-${n}-fg`,
    `avatar-${n}-bg`,
    TEXT,
  ]),
];

describe.each([
  ['light', parseBlock(':root')],
  ['dark', parseBlock('.dark')],
])('%s theme tokens', (_theme, palette) => {
  it('defines the same tokens as the light theme', () => {
    expect(Object.keys(palette).sort()).toEqual(Object.keys(parseBlock(':root')).sort());
  });

  it.each(pairs)('%s on %s meets %s:1 contrast', (fg, bg, min) => {
    const fgHex = palette[fg];
    const bgHex = palette[bg];

    expect(fgHex, `missing --${fg}`).toBeDefined();
    expect(bgHex, `missing --${bg}`).toBeDefined();
    expect(contrast(fgHex ?? '', bgHex ?? '')).toBeGreaterThanOrEqual(min);
  });
});
