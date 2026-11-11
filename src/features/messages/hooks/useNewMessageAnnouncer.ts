import { useEffect, useState } from 'react';
import { useChatStore } from '@/store';

/**
 * Text for a polite live region: "New message from Ava Patel: …" whenever someone else's
 * message arrives in this chat. Status/edit updates of the same message are ignored.
 */
export function useNewMessageAnnouncer(conversationId: string): string {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    let lastId = useChatStore.getState().conversations[conversationId]?.lastMessage?.id;
    return useChatStore.subscribe((state) => {
      const last = state.conversations[conversationId]?.lastMessage;
      if (!last || last.id === lastId) return;
      lastId = last.id;
      if (last.senderId === state.currentUserId) return;
      const sender = state.users[last.senderId]?.name ?? 'Someone';
      setAnnouncement(`New message from ${sender}: ${last.text || 'an attachment'}`);
    });
  }, [conversationId]);

  return announcement;
}
