import { lazy } from 'react';

/** Loaded on first open, in its own chunk: most visits never show group info. */
export const GroupInfoPanel = lazy(() =>
  import('./components').then((module) => ({ default: module.GroupInfoPanel })),
);
