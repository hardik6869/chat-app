import { createBrowserRouter, RouterProvider } from 'react-router';
import { ErrorBoundary, Toaster } from '@/shared/ui';
import { routes } from './routes';

const router = createBrowserRouter(routes);

export function App() {
  return (
    <ErrorBoundary title="The app ran into a problem" className="h-dvh">
      <RouterProvider router={router} />
      <Toaster />
    </ErrorBoundary>
  );
}
