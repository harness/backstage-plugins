import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const harnessCiCdPlugin = createPlugin({
  id: 'harness-ci-cd',
  routes: {
    root: rootRouteRef,
  },
});

export const HarnessCiCdPage = harnessCiCdPlugin.provide(
  createRoutableExtension({
    name: 'HarnessCiCdPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
