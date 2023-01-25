import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const harnessFeatureFlagsPlugin = createPlugin({
  id: 'harness-feature-flags',
  routes: {
    root: rootRouteRef,
  },
});

export const HarnessFeatureFlagsPage = harnessFeatureFlagsPlugin.provide(
  createRoutableExtension({
    name: 'HarnessFeatureFlagsPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
