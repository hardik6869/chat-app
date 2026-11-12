import { createBrowserRouter, RouterProvider } from 'react-router';
import { ErrorBoundary, Toaster } from '@/shared/ui';
import { routes } from './routes';

// BASE_URL is '/' locally and '/chat-app/' on GitHub Pages.
const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

export function App() {
  return (
    <ErrorBoundary title="The app ran into a problem" className="h-dvh">
      <RouterProvider router={router} />
      <Toaster />
    </ErrorBoundary>
  );
}
