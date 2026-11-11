import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/design-system';
import { App } from '@/app';
import { captureError } from '@/shared/lib';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

// Route React's error reporting to one place instead of the console.
createRoot(rootElement, {
  onCaughtError: (error) => {
    captureError(error, 'react.caught');
  },
  onUncaughtError: (error) => {
    captureError(error, 'react.uncaught');
  },
  onRecoverableError: (error) => {
    captureError(error, 'react.recoverable');
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
