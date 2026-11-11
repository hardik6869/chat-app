import { captureError } from './captureError';

/** Copies text to the clipboard. Resolves `false` (and reports) when the browser refuses. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    captureError(error, 'clipboard.writeText');
    return false;
  }
}
