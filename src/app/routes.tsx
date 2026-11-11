import type { RouteObject } from 'react-router';
import { NoConversationSelected } from '@/features/messages';
import { ChatLayout } from './layout';
import { ConversationPage, NotFoundPage } from './pages';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <ChatLayout />,
    children: [
      { index: true, element: <NoConversationSelected /> },
      { path: 'c/:conversationId', element: <ConversationPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];
