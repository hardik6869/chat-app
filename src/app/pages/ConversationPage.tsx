import { Info } from 'lucide-react';
import { useRef, useState } from 'react';
import { useParams } from 'react-router';
import { GroupInfoPanel, useIsGroup } from '@/features/groups';
import { ChatWindow } from '@/features/messages';
import { IconButton } from '@/shared/ui';

/** Composes the chat with the group info panel; the two features stay independent. */
function Conversation({ conversationId }: { conversationId: string }) {
  const isGroup = useIsGroup(conversationId);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  const closeInfo = () => {
    setInfoOpen(false);
    infoButtonRef.current?.focus();
  };

  return (
    <ChatWindow
      conversationId={conversationId}
      headerActions={
        isGroup && (
          <IconButton
            ref={infoButtonRef}
            icon={Info}
            label="Group info"
            aria-expanded={infoOpen}
            onClick={() => {
              setInfoOpen((open) => !open);
            }}
          />
        )
      }
      aside={
        isGroup &&
        infoOpen && <GroupInfoPanel conversationId={conversationId} onClose={closeInfo} />
      }
    />
  );
}

export function ConversationPage() {
  const { conversationId = '' } = useParams();
  // `key` resets per-conversation UI state (scroll, composer, panels) when switching chats.
  return <Conversation key={conversationId} conversationId={conversationId} />;
}
