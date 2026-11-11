import { useParams } from 'react-router';
import { ChatWindow } from '@/features/messages';

export function ConversationPage() {
  const { conversationId = '' } = useParams();
  // `key` resets per-conversation UI state (scroll, composer) when switching chats.
  return <ChatWindow key={conversationId} conversationId={conversationId} />;
}
