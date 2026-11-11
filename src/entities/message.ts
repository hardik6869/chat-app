/** Lifecycle of an outgoing message: optimistic → server → recipient → seen (or failed). */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/** Longest message the composer and API accept. */
export const MAX_MESSAGE_LENGTH = 4000;

/** Attachment limits: how many files per message, and the largest file allowed. */
export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

/** A local file shown in the chat (nothing is uploaded: `url` is an object URL). */
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  /** ISO timestamps keep messages serializable for persistence. */
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
  status: MessageStatus;
  replyToId?: string;
  attachments?: Attachment[];
  reactions: Reaction[];
}

/** Only the author can edit, and never after deleting or while the send failed. */
export function canEditMessage(message: Message, currentUserId: string): boolean {
  return (
    message.senderId === currentUserId &&
    message.deletedAt === undefined &&
    message.status !== 'failed'
  );
}

/** Adds the user's reaction, or removes it if they already reacted with that emoji. */
export function toggleReaction(reactions: readonly Reaction[], emoji: string, userId: string) {
  const existing = reactions.find((reaction) => reaction.emoji === emoji);

  if (!existing) return [...reactions, { emoji, userIds: [userId] }];

  const userIds = existing.userIds.includes(userId)
    ? existing.userIds.filter((id) => id !== userId)
    : [...existing.userIds, userId];

  return userIds.length === 0
    ? reactions.filter((reaction) => reaction !== existing)
    : reactions.map((reaction) => (reaction === existing ? { emoji, userIds } : reaction));
}
