import { Info } from 'lucide-react';
import { Suspense, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { GroupInfoPanel, useIsGroup } from '@/features/groups';
import { ChatWindow } from '@/features/messages';
import { IconButton, Spinner } from '@/shared/ui';

function PanelFallback() {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface md:left-auto md:w-80 md:border-l md:border-border xl:static">
      <Spinner label="Loading group info" />
    </div>
  );
}

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
        infoOpen && (
          <Suspense fallback={<PanelFallback />}>
            <GroupInfoPanel conversationId={conversationId} onClose={closeInfo} />
          </Suspense>
        )
      }
    />
  );
}

export function ConversationPage() {
  const { conversationId = '' } = useParams();
  // `key` resets per-conversation UI state (scroll, composer, panels) when switching chats.
  return <Conversation key={conversationId} conversationId={conversationId} />;
}
