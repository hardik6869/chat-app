import { MAX_MESSAGE_LENGTH } from '@/entities';
import { ApiError } from './errors';

/** Trims and checks message text the way a real server would. */
export function validateText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) throw new ApiError('VALIDATION', 'Message cannot be empty');
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new ApiError('VALIDATION', `Message is longer than ${MAX_MESSAGE_LENGTH} characters`);
  }
  return trimmed;
}
