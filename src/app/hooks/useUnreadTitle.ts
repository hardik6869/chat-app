import { useEffect } from 'react';
import { selectTotalUnread, useChatStore } from '@/store';

/** "(3) Chat App" while there are unread messages, so they're visible from other tabs. */
export function useUnreadTitle(baseTitle = 'Chat App') {
  const total = useChatStore(selectTotalUnread);

  useEffect(() => {
    document.title = total > 0 ? `(${total}) ${baseTitle}` : baseTitle;
  }, [total, baseTitle]);

  useEffect(
    () => () => {
      document.title = baseTitle;
    },
    [baseTitle],
  );
}
